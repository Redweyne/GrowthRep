from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import google.generativeai as genai

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30

# AI Configuration
AI_API_KEY = os.environ.get('AI_API_KEY', os.environ.get('EMERGENT_LLM_KEY', ''))


# ============ MODELS ============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GoalMilestone(BaseModel):
    text: str
    completed: bool = False

class Goal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str = ""
    category: str = "personal"  # career, health, finance, relationships, personal, skills
    principle: str = "think_and_grow_rich"  # 'think_and_grow_rich', 'atomic_habits', 'obstacle_is_the_way'
    why: str = ""  # The deeper purpose behind the goal
    target_date: Optional[str] = None
    milestones: List[Dict[str, Any]] = []  # List of {text: str, completed: bool}
    status: str = "active"  # active, completed, archived
    progress: int = 0  # 0-100
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GoalCreate(BaseModel):
    title: str
    description: str = ""
    category: str = "personal"
    principle: str = "think_and_grow_rich"
    why: str = ""
    target_date: Optional[str] = None
    milestones: Optional[List[Dict[str, Any]]] = []

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    principle: Optional[str] = None
    why: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    target_date: Optional[str] = None
    milestones: Optional[List[Dict[str, Any]]] = None

class Habit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    description: str
    frequency: str  # daily, weekly
    streak: int = 0
    best_streak: int = 0
    last_completed: Optional[str] = None
    completion_dates: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HabitCreate(BaseModel):
    name: str
    description: str
    frequency: str = "daily"

class VisionBoardItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # 'text', 'image', 'quote'
    content: str
    position: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VisionBoardItemCreate(BaseModel):
    type: str
    content: str
    position: Optional[Dict[str, Any]] = None

class JournalEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content: str
    mood: Optional[str] = None
    gratitude: Optional[List[str]] = []
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).date().isoformat())
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JournalEntryCreate(BaseModel):
    content: str
    mood: Optional[str] = None
    gratitude: Optional[List[str]] = []

class Exercise(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    exercise_type: str  # 'gratitude', 'affirmation', 'obstacle_reframe', 'goal_setting'
    content: Dict[str, Any]
    completed: bool = False
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).date().isoformat())
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExerciseCreate(BaseModel):
    exercise_type: str
    content: Dict[str, Any]

class AICoachRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class AICoachResponse(BaseModel):
    response: str
    session_id: str


# ============ AUTH HELPERS ============
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    return jwt.encode(
        {"user_id": user_id, "exp": expiration},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ============ AUTH ROUTES ============
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name
    )
    user_dict = user.model_dump()
    user_dict['password_hash'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'])
    return {"token": token, "user": {"id": user['id'], "email": user['email'], "name": user['name']}}


# ============ GOALS ROUTES ============
@api_router.post("/goals", response_model=Goal)
async def create_goal(goal_data: GoalCreate, user_id: str = Depends(get_current_user)):
    goal_dict_data = goal_data.model_dump()
    # Calculate initial progress based on milestones
    milestones = goal_dict_data.get('milestones', [])
    if milestones:
        completed_count = sum(1 for m in milestones if m.get('completed', False))
        progress = int((completed_count / len(milestones)) * 100) if milestones else 0
    else:
        progress = 0
    goal_dict_data['progress'] = progress
    
    goal = Goal(user_id=user_id, **goal_dict_data)
    goal_dict = goal.model_dump()
    goal_dict['created_at'] = goal_dict['created_at'].isoformat()
    goal_dict['updated_at'] = goal_dict['updated_at'].isoformat()
    
    await db.goals.insert_one(goal_dict)
    return goal

@api_router.get("/goals", response_model=List[Goal])
async def get_goals(user_id: str = Depends(get_current_user)):
    goals = await db.goals.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    for goal in goals:
        if isinstance(goal['created_at'], str):
            goal['created_at'] = datetime.fromisoformat(goal['created_at'])
        if isinstance(goal['updated_at'], str):
            goal['updated_at'] = datetime.fromisoformat(goal['updated_at'])
    return goals

@api_router.put("/goals/{goal_id}", response_model=Goal)
async def update_goal(goal_id: str, goal_update: GoalUpdate, user_id: str = Depends(get_current_user)):
    existing_goal = await db.goals.find_one({"id": goal_id, "user_id": user_id})
    if not existing_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = {k: v for k, v in goal_update.model_dump().items() if v is not None}
    
    # Calculate progress based on milestones if milestones are updated
    if 'milestones' in update_data:
        milestones = update_data['milestones']
        if milestones:
            completed_count = sum(1 for m in milestones if m.get('completed', False))
            update_data['progress'] = int((completed_count / len(milestones)) * 100)
            # Auto-complete goal if all milestones are done
            if completed_count == len(milestones) and len(milestones) > 0:
                if update_data.get('status') != 'completed':
                    update_data['status'] = 'completed'
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.goals.update_one({"id": goal_id}, {"$set": update_data})
    
    updated_goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    if isinstance(updated_goal['created_at'], str):
        updated_goal['created_at'] = datetime.fromisoformat(updated_goal['created_at'])
    if isinstance(updated_goal['updated_at'], str):
        updated_goal['updated_at'] = datetime.fromisoformat(updated_goal['updated_at'])
    return Goal(**updated_goal)

@api_router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, user_id: str = Depends(get_current_user)):
    result = await db.goals.delete_one({"id": goal_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal deleted"}


# ============ HABITS ROUTES ============
@api_router.post("/habits", response_model=Habit)
async def create_habit(habit_data: HabitCreate, user_id: str = Depends(get_current_user)):
    habit = Habit(user_id=user_id, **habit_data.model_dump())
    habit_dict = habit.model_dump()
    habit_dict['created_at'] = habit_dict['created_at'].isoformat()
    
    await db.habits.insert_one(habit_dict)
    return habit

@api_router.get("/habits", response_model=List[Habit])
async def get_habits(user_id: str = Depends(get_current_user)):
    habits = await db.habits.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    for habit in habits:
        if isinstance(habit['created_at'], str):
            habit['created_at'] = datetime.fromisoformat(habit['created_at'])
    return habits

@api_router.post("/habits/{habit_id}/complete")
async def complete_habit(habit_id: str, user_id: str = Depends(get_current_user)):
    habit = await db.habits.find_one({"id": habit_id, "user_id": user_id})
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    today = datetime.now(timezone.utc).date().isoformat()
    completion_dates = habit.get('completion_dates', [])
    
    if today not in completion_dates:
        completion_dates.append(today)
        
        # Calculate streak
        sorted_dates = sorted(completion_dates, reverse=True)
        streak = 1
        for i in range(len(sorted_dates) - 1):
            current = datetime.fromisoformat(sorted_dates[i]).date()
            previous = datetime.fromisoformat(sorted_dates[i + 1]).date()
            if (current - previous).days == 1:
                streak += 1
            else:
                break
        
        best_streak = max(habit.get('best_streak', 0), streak)
        
        await db.habits.update_one(
            {"id": habit_id},
            {"$set": {
                "completion_dates": completion_dates,
                "last_completed": today,
                "streak": streak,
                "best_streak": best_streak
            }}
        )
    
    return {"message": "Habit completed", "streak": streak}

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None

@api_router.put("/habits/{habit_id}")
async def update_habit(habit_id: str, habit_update: HabitUpdate, user_id: str = Depends(get_current_user)):
    habit = await db.habits.find_one({"id": habit_id, "user_id": user_id})
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    update_data = {k: v for k, v in habit_update.model_dump().items() if v is not None}
    if update_data:
        await db.habits.update_one({"id": habit_id}, {"$set": update_data})
    
    updated_habit = await db.habits.find_one({"id": habit_id}, {"_id": 0})
    return updated_habit

@api_router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str, user_id: str = Depends(get_current_user)):
    result = await db.habits.delete_one({"id": habit_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"message": "Habit deleted"}


# ============ VISION BOARD ROUTES ============
@api_router.post("/vision-board", response_model=VisionBoardItem)
async def create_vision_item(item_data: VisionBoardItemCreate, user_id: str = Depends(get_current_user)):
    item = VisionBoardItem(user_id=user_id, **item_data.model_dump())
    item_dict = item.model_dump()
    item_dict['created_at'] = item_dict['created_at'].isoformat()
    
    await db.vision_board.insert_one(item_dict)
    return item

@api_router.get("/vision-board", response_model=List[VisionBoardItem])
async def get_vision_board(user_id: str = Depends(get_current_user)):
    items = await db.vision_board.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item['created_at'], str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items

@api_router.delete("/vision-board/{item_id}")
async def delete_vision_item(item_id: str, user_id: str = Depends(get_current_user)):
    result = await db.vision_board.delete_one({"id": item_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}


# ============ JOURNAL ROUTES ============
@api_router.post("/journal", response_model=JournalEntry)
async def create_journal_entry(entry_data: JournalEntryCreate, user_id: str = Depends(get_current_user)):
    entry = JournalEntry(user_id=user_id, **entry_data.model_dump())
    entry_dict = entry.model_dump()
    entry_dict['created_at'] = entry_dict['created_at'].isoformat()
    
    await db.journal.insert_one(entry_dict)
    return entry

@api_router.get("/journal", response_model=List[JournalEntry])
async def get_journal_entries(user_id: str = Depends(get_current_user)):
    entries = await db.journal.find({"user_id": user_id}, {"_id": 0}).sort("date", -1).to_list(1000)
    for entry in entries:
        if isinstance(entry['created_at'], str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
    return entries


# ============ EXERCISES ROUTES ============
@api_router.post("/exercises", response_model=Exercise)
async def create_exercise(exercise_data: ExerciseCreate, user_id: str = Depends(get_current_user)):
    exercise = Exercise(user_id=user_id, **exercise_data.model_dump(), completed=True)
    exercise_dict = exercise.model_dump()
    exercise_dict['created_at'] = exercise_dict['created_at'].isoformat()
    
    await db.exercises.insert_one(exercise_dict)
    return exercise

@api_router.get("/exercises", response_model=List[Exercise])
async def get_exercises(user_id: str = Depends(get_current_user)):
    exercises = await db.exercises.find({"user_id": user_id}, {"_id": 0}).sort("date", -1).to_list(1000)
    for exercise in exercises:
        if isinstance(exercise['created_at'], str):
            exercise['created_at'] = datetime.fromisoformat(exercise['created_at'])
    return exercises


# ============ AI COACH ROUTES ============
@api_router.post("/ai-coach", response_model=AICoachResponse)
async def ai_coach(request: AICoachRequest, user_id: str = Depends(get_current_user)):
    try:
        # Get user context - goals, habits, recent journal entries
        goals = await db.goals.find({"user_id": user_id, "status": "active"}, {"_id": 0}).to_list(10)
        habits = await db.habits.find({"user_id": user_id}, {"_id": 0}).to_list(10)
        recent_journals = await db.journal_entries.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(3).to_list(3)
        
        # Determine mentor personality
        mentor = request.context.get('mentor_personality', 'hill') if request.context else 'hill'
        
        # Personality-specific system prompts
        mentor_prompts = {
            'hill': f"""You are Napoleon Hill, author of 'Think and Grow Rich'. You help people develop a success mindset and achieve their definite chief aim.

User Context:
- Active Goals: {len(goals)}
- Habits Tracked: {len(habits)}
- Recent Reflections: {len(recent_journals)}

Your coaching style:
- Focus on the power of thought, desire, and persistence
- Emphasize developing a burning desire and definite purpose
- Teach the principles of auto-suggestion and faith
- Help users overcome fear and develop a millionaire mindset
- Speak with authority and inspiration
- Reference concepts like "the mastermind principle" and "transmutation of sexual energy into creative achievement"

Be encouraging, visionary, and help users see their unlimited potential. Whatever the mind can conceive and believe, it can achieve.""",
            
            'clear': f"""You are James Clear, author of 'Atomic Habits'. You help people build better habits through small, incremental changes.

User Context:
- Active Goals: {len(goals)}
- Habits Tracked: {len(habits)}
- Recent Reflections: {len(recent_journals)}

Your coaching style:
- Focus on systems over goals
- Teach the habit loop: cue, craving, response, reward
- Emphasize making habits obvious, attractive, easy, and satisfying
- Help users focus on identity-based habits ("become the type of person who...")
- Use practical examples and scientific research
- Speak in a clear, actionable, and friendly manner
- Reference concepts like "the plateau of latent potential" and "the aggregation of marginal gains"

Be practical, encouraging, and help users understand that small changes compound into remarkable results.""",
            
            'holiday': f"""You are Ryan Holiday, author of 'The Obstacle Is The Way'. You help people apply Stoic philosophy to modern challenges.

User Context:
- Active Goals: {len(goals)}
- Habits Tracked: {len(habits)}
- Recent Reflections: {len(recent_journals)}

Your coaching style:
- Focus on perception, action, and will
- Teach that the obstacle in the path becomes the path
- Help users reframe challenges as opportunities
- Emphasize what's in their control vs what's not
- Share stories of historical figures who embodied Stoic principles
- Speak with calm wisdom and philosophical depth
- Reference Stoic concepts like "amor fati" (love of fate) and "premeditatio malorum" (negative visualization)

Be thoughtful, challenging, and help users see that every obstacle contains the seed of an equal or greater opportunity."""
        }
        
        context_info = mentor_prompts.get(mentor, mentor_prompts['hill'])
        
        session_id = request.context.get('session_id', str(uuid.uuid4())) if request.context else str(uuid.uuid4())
        
        if not AI_API_KEY:
            raise HTTPException(status_code=500, detail="AI API key not configured")
        
        genai.configure(api_key=AI_API_KEY)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=context_info
        )
        
        response = model.generate_content(request.message)
        response_text = response.text if response.text else "I'm sorry, I couldn't generate a response."
        
        return AICoachResponse(response=response_text, session_id=session_id)
    
    except Exception as e:
        logger.error(f"AI Coach error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


# ============ ANALYTICS ROUTES ============
@api_router.get("/analytics/overview")
async def get_analytics(user_id: str = Depends(get_current_user)):
    goals = await db.goals.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    habits = await db.habits.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    journal_entries = await db.journal.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    exercises = await db.exercises.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Calculate stats
    total_goals = len(goals)
    completed_goals = len([g for g in goals if g.get('status') == 'completed'])
    active_goals = len([g for g in goals if g.get('status') == 'active'])
    
    total_habits = len(habits)
    max_streak = max([h.get('streak', 0) for h in habits], default=0)
    best_streak_ever = max([h.get('best_streak', 0) for h in habits], default=0)
    avg_streak = sum([h.get('streak', 0) for h in habits]) / total_habits if total_habits > 0 else 0
    
    journal_count = len(journal_entries)
    exercise_count = len(exercises)
    
    # Habit completion rate (last 7 days)
    today = datetime.now(timezone.utc).date()
    last_7_days = [(today - timedelta(days=i)).isoformat() for i in range(7)]
    
    habit_completions = []
    for date in last_7_days:
        completed_today = sum(1 for h in habits if date in h.get('completion_dates', []))
        habit_completions.append({
            "date": date,
            "completed": completed_today,
            "total": total_habits
        })
    
    # Calculate total completions
    total_completions = sum(len(h.get('completion_dates', [])) for h in habits)
    
    # Goals by category
    goals_by_category = {}
    for g in goals:
        cat = g.get('category', 'personal')
        if cat not in goals_by_category:
            goals_by_category[cat] = {'total': 0, 'completed': 0}
        goals_by_category[cat]['total'] += 1
        if g.get('status') == 'completed':
            goals_by_category[cat]['completed'] += 1
    
    # Journal streak
    journal_streak = 0
    if journal_entries:
        sorted_entries = sorted(journal_entries, key=lambda x: x.get('date', ''), reverse=True)
        check_date = today
        for entry in sorted_entries:
            if entry.get('date') == check_date.isoformat():
                journal_streak += 1
                check_date -= timedelta(days=1)
            elif entry.get('date') < check_date.isoformat():
                break
    
    # Mood distribution from journal
    mood_counts = {}
    for entry in journal_entries:
        mood = entry.get('mood', 'reflective')
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    return {
        "goals": {
            "total": total_goals,
            "active": active_goals,
            "completed": completed_goals,
            "completion_rate": round(completed_goals / total_goals * 100, 1) if total_goals > 0 else 0,
            "by_category": goals_by_category
        },
        "habits": {
            "total": total_habits,
            "max_streak": max_streak,
            "best_streak_ever": best_streak_ever,
            "avg_streak": round(avg_streak, 1),
            "total_completions": total_completions
        },
        "journal": {
            "total_entries": journal_count,
            "current_streak": journal_streak,
            "mood_distribution": mood_counts
        },
        "exercises": {
            "total_completed": exercise_count
        },
        "habit_completions_7_days": habit_completions
    }


# ============ NEW FEATURES: RITUAL MODE & WISDOM LIBRARY ============

class RitualCompletion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    ritual_type: str  # morning, midday, evening, focus
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RitualCompleteRequest(BaseModel):
    ritual_type: str
    completed_at: str

class WisdomFavorite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    quote_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WisdomFavoriteCreate(BaseModel):
    quote_id: str

class WisdomNotificationPreference(BaseModel):
    enabled: bool

@api_router.post("/rituals/complete")
async def complete_ritual(ritual_data: RitualCompleteRequest, user_id: str = Depends(get_current_user)):
    """Complete a ritual"""
    ritual = RitualCompletion(
        user_id=user_id,
        ritual_type=ritual_data.ritual_type,
        completed_at=datetime.fromisoformat(ritual_data.completed_at.replace('Z', '+00:00'))
    )
    
    result = await db.ritual_completions.insert_one(ritual.model_dump())
    return {"message": "Ritual completed", "id": ritual.id}

@api_router.get("/rituals/completed")
async def get_completed_rituals(user_id: str = Depends(get_current_user)):
    """Get user's completed rituals"""
    rituals = await db.ritual_completions.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("completed_at", -1).limit(50).to_list(50)
    
    return rituals

@api_router.post("/wisdom/favorites")
async def add_wisdom_favorite(favorite_data: WisdomFavoriteCreate, user_id: str = Depends(get_current_user)):
    """Add a quote to favorites"""
    # Check if already favorited
    existing = await db.wisdom_favorites.find_one({
        "user_id": user_id,
        "quote_id": favorite_data.quote_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")
    
    favorite = WisdomFavorite(
        user_id=user_id,
        quote_id=favorite_data.quote_id
    )
    
    await db.wisdom_favorites.insert_one(favorite.model_dump())
    return {"message": "Added to favorites", "id": favorite.id}

@api_router.get("/wisdom/favorites")
async def get_wisdom_favorites(user_id: str = Depends(get_current_user)):
    """Get user's favorite quotes"""
    favorites = await db.wisdom_favorites.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return favorites

@api_router.delete("/wisdom/favorites/{quote_id}")
async def remove_wisdom_favorite(quote_id: str, user_id: str = Depends(get_current_user)):
    """Remove a quote from favorites"""
    result = await db.wisdom_favorites.delete_one({
        "user_id": user_id,
        "quote_id": quote_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Removed from favorites"}

@api_router.post("/wisdom/notifications")
async def update_wisdom_notifications(prefs: WisdomNotificationPreference, user_id: str = Depends(get_current_user)):
    """Update wisdom notification preferences"""
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"wisdom_notifications": prefs.enabled}}
    )
    return {"message": "Notification preferences updated", "enabled": prefs.enabled}


# ============ IDENTITY EVOLUTION ============
class IdentityStatement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    old_identity: str  # "I am someone who..."
    new_identity: str  # "I am someone who..."
    evidence_count: int = 0  # Votes for new identity
    strength_score: int = 0  # 0-100
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IdentityStatementCreate(BaseModel):
    old_identity: str
    new_identity: str

class IdentityEvidence(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    identity_id: str
    evidence_text: str
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).date().isoformat())
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IdentityEvidenceCreate(BaseModel):
    identity_id: str
    evidence_text: str

@api_router.post("/identity/statements", response_model=IdentityStatement)
async def create_identity_statement(data: IdentityStatementCreate, user_id: str = Depends(get_current_user)):
    """Create a new identity statement"""
    identity = IdentityStatement(user_id=user_id, **data.model_dump())
    identity_dict = identity.model_dump()
    identity_dict['created_at'] = identity_dict['created_at'].isoformat()
    identity_dict['updated_at'] = identity_dict['updated_at'].isoformat()
    
    await db.identity_statements.insert_one(identity_dict)
    return identity

@api_router.get("/identity/statements", response_model=List[IdentityStatement])
async def get_identity_statements(user_id: str = Depends(get_current_user)):
    """Get all identity statements"""
    statements = await db.identity_statements.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    for stmt in statements:
        if isinstance(stmt['created_at'], str):
            stmt['created_at'] = datetime.fromisoformat(stmt['created_at'])
        if isinstance(stmt['updated_at'], str):
            stmt['updated_at'] = datetime.fromisoformat(stmt['updated_at'])
    return statements

@api_router.post("/identity/evidence", response_model=IdentityEvidence)
async def add_identity_evidence(data: IdentityEvidenceCreate, user_id: str = Depends(get_current_user)):
    """Add evidence for identity transformation"""
    evidence = IdentityEvidence(user_id=user_id, **data.model_dump())
    evidence_dict = evidence.model_dump()
    evidence_dict['created_at'] = evidence_dict['created_at'].isoformat()
    
    await db.identity_evidence.insert_one(evidence_dict)
    
    # Update identity statement counts
    evidence_count = await db.identity_evidence.count_documents({
        "user_id": user_id,
        "identity_id": data.identity_id
    })
    
    # Calculate strength score (evidence count translates to 0-100)
    strength_score = min(100, evidence_count * 2)  # Each evidence = 2 points
    
    await db.identity_statements.update_one(
        {"id": data.identity_id, "user_id": user_id},
        {"$set": {
            "evidence_count": evidence_count,
            "strength_score": strength_score,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return evidence

@api_router.get("/identity/evidence/{identity_id}")
async def get_identity_evidence(identity_id: str, user_id: str = Depends(get_current_user)):
    """Get all evidence for a specific identity"""
    evidence_list = await db.identity_evidence.find(
        {"user_id": user_id, "identity_id": identity_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return evidence_list


# ============ OBSTACLE TRANSFORMER ============
class Obstacle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    obstacle_text: str
    perception: Optional[str] = None  # How you see it
    action: Optional[str] = None  # What you can do
    will: Optional[str] = None  # Accepting what you can't control
    status: str = "active"  # active, transformed, archived
    transformed_at: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ObstacleCreate(BaseModel):
    obstacle_text: str

class ObstacleUpdate(BaseModel):
    perception: Optional[str] = None
    action: Optional[str] = None
    will: Optional[str] = None
    status: Optional[str] = None

@api_router.post("/obstacles", response_model=Obstacle)
async def create_obstacle(data: ObstacleCreate, user_id: str = Depends(get_current_user)):
    """Document a new obstacle"""
    obstacle = Obstacle(user_id=user_id, **data.model_dump())
    obstacle_dict = obstacle.model_dump()
    obstacle_dict['created_at'] = obstacle_dict['created_at'].isoformat()
    obstacle_dict['updated_at'] = obstacle_dict['updated_at'].isoformat()
    
    await db.obstacles.insert_one(obstacle_dict)
    return obstacle

@api_router.get("/obstacles", response_model=List[Obstacle])
async def get_obstacles(user_id: str = Depends(get_current_user)):
    """Get all obstacles"""
    obstacles = await db.obstacles.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for obs in obstacles:
        if isinstance(obs['created_at'], str):
            obs['created_at'] = datetime.fromisoformat(obs['created_at'])
        if isinstance(obs['updated_at'], str):
            obs['updated_at'] = datetime.fromisoformat(obs['updated_at'])
    return obstacles

@api_router.put("/obstacles/{obstacle_id}", response_model=Obstacle)
async def update_obstacle(obstacle_id: str, data: ObstacleUpdate, user_id: str = Depends(get_current_user)):
    """Update obstacle transformation"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Mark as transformed if all three steps are complete
    existing = await db.obstacles.find_one({"id": obstacle_id, "user_id": user_id})
    if existing:
        if (update_data.get('perception') or existing.get('perception')) and \
           (update_data.get('action') or existing.get('action')) and \
           (update_data.get('will') or existing.get('will')):
            if existing.get('status') != 'transformed':
                update_data['status'] = 'transformed'
                update_data['transformed_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.obstacles.update_one({"id": obstacle_id, "user_id": user_id}, {"$set": update_data})
    
    updated_obstacle = await db.obstacles.find_one({"id": obstacle_id}, {"_id": 0})
    if isinstance(updated_obstacle['created_at'], str):
        updated_obstacle['created_at'] = datetime.fromisoformat(updated_obstacle['created_at'])
    if isinstance(updated_obstacle['updated_at'], str):
        updated_obstacle['updated_at'] = datetime.fromisoformat(updated_obstacle['updated_at'])
    return Obstacle(**updated_obstacle)

@api_router.delete("/obstacles/{obstacle_id}")
async def delete_obstacle(obstacle_id: str, user_id: str = Depends(get_current_user)):
    """Delete an obstacle"""
    result = await db.obstacles.delete_one({"id": obstacle_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Obstacle not found")
    return {"message": "Obstacle deleted"}


# ============ BURNING DESIRE SYSTEM ============
class BurningDesire(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    desire_text: str  # The ONE thing
    why_text: str  # Why it matters
    vision_text: str  # 1 year from now description
    intensity: int = 10  # 1-10 scale
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BurningDesireCreate(BaseModel):
    desire_text: str
    why_text: str
    vision_text: str
    intensity: int = 10

class BurningDesireUpdate(BaseModel):
    desire_text: Optional[str] = None
    why_text: Optional[str] = None
    vision_text: Optional[str] = None
    intensity: Optional[int] = None

class DesireVisualization(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    desire_id: str
    intensity_rating: int  # 1-10
    emotion: str  # excited, determined, anxious, confident, etc.
    notes: Optional[str] = None
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).date().isoformat())
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DesireVisualizationCreate(BaseModel):
    desire_id: str
    intensity_rating: int
    emotion: str
    notes: Optional[str] = None

@api_router.post("/burning-desire", response_model=BurningDesire)
async def create_burning_desire(data: BurningDesireCreate, user_id: str = Depends(get_current_user)):
    """Create or update burning desire"""
    # Check if user already has a burning desire
    existing = await db.burning_desires.find_one({"user_id": user_id})
    
    if existing:
        # Update existing
        update_data = data.model_dump()
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.burning_desires.update_one({"user_id": user_id}, {"$set": update_data})
        
        updated = await db.burning_desires.find_one({"user_id": user_id}, {"_id": 0})
        if isinstance(updated['created_at'], str):
            updated['created_at'] = datetime.fromisoformat(updated['created_at'])
        if isinstance(updated['updated_at'], str):
            updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
        return BurningDesire(**updated)
    else:
        # Create new
        desire = BurningDesire(user_id=user_id, **data.model_dump())
        desire_dict = desire.model_dump()
        desire_dict['created_at'] = desire_dict['created_at'].isoformat()
        desire_dict['updated_at'] = desire_dict['updated_at'].isoformat()
        
        await db.burning_desires.insert_one(desire_dict)
        return desire

@api_router.get("/burning-desire", response_model=BurningDesire)
async def get_burning_desire(user_id: str = Depends(get_current_user)):
    """Get user's burning desire"""
    desire = await db.burning_desires.find_one({"user_id": user_id}, {"_id": 0})
    if not desire:
        raise HTTPException(status_code=404, detail="No burning desire set")
    
    if isinstance(desire['created_at'], str):
        desire['created_at'] = datetime.fromisoformat(desire['created_at'])
    if isinstance(desire['updated_at'], str):
        desire['updated_at'] = datetime.fromisoformat(desire['updated_at'])
    return BurningDesire(**desire)

@api_router.post("/burning-desire/visualizations", response_model=DesireVisualization)
async def create_visualization(data: DesireVisualizationCreate, user_id: str = Depends(get_current_user)):
    """Track daily visualization"""
    viz = DesireVisualization(user_id=user_id, **data.model_dump())
    viz_dict = viz.model_dump()
    viz_dict['created_at'] = viz_dict['created_at'].isoformat()
    
    await db.desire_visualizations.insert_one(viz_dict)
    return viz

@api_router.get("/burning-desire/visualizations")
async def get_visualizations(user_id: str = Depends(get_current_user)):
    """Get visualization history"""
    visualizations = await db.desire_visualizations.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(30).to_list(30)
    return visualizations


# ============ PREMEDITATIO PRACTICE ============
class PremeditatioPractice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    scenario: str  # What challenge are you preparing for?
    potential_obstacles: List[str] = []
    planned_responses: List[str] = []
    resilience_score: Optional[int] = None  # 1-10, set after reflection
    actual_outcome: Optional[str] = None  # What actually happened
    lessons_learned: Optional[str] = None
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).date().isoformat())
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PremeditatioPracticeCreate(BaseModel):
    scenario: str
    potential_obstacles: List[str] = []
    planned_responses: List[str] = []

class PremeditatioPracticeUpdate(BaseModel):
    resilience_score: Optional[int] = None
    actual_outcome: Optional[str] = None
    lessons_learned: Optional[str] = None

@api_router.post("/premeditatio", response_model=PremeditatioPractice)
async def create_premeditatio(data: PremeditatioPracticeCreate, user_id: str = Depends(get_current_user)):
    """Create a premeditatio practice"""
    practice = PremeditatioPractice(user_id=user_id, **data.model_dump())
    practice_dict = practice.model_dump()
    practice_dict['created_at'] = practice_dict['created_at'].isoformat()
    practice_dict['updated_at'] = practice_dict['updated_at'].isoformat()
    
    await db.premeditatio_practices.insert_one(practice_dict)
    return practice

@api_router.get("/premeditatio", response_model=List[PremeditatioPractice])
async def get_premeditatio_practices(user_id: str = Depends(get_current_user)):
    """Get all premeditatio practices"""
    practices = await db.premeditatio_practices.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for practice in practices:
        if isinstance(practice['created_at'], str):
            practice['created_at'] = datetime.fromisoformat(practice['created_at'])
        if isinstance(practice['updated_at'], str):
            practice['updated_at'] = datetime.fromisoformat(practice['updated_at'])
    return practices

@api_router.put("/premeditatio/{practice_id}", response_model=PremeditatioPractice)
async def update_premeditatio(practice_id: str, data: PremeditatioPracticeUpdate, user_id: str = Depends(get_current_user)):
    """Update premeditatio with actual outcomes"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.premeditatio_practices.update_one({"id": practice_id, "user_id": user_id}, {"$set": update_data})
    
    updated = await db.premeditatio_practices.find_one({"id": practice_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated['updated_at'], str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return PremeditatioPractice(**updated)


# ============ HABIT STACKING ============
class HabitChain(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str  # Name of the chain
    existing_habit: str  # "After I..."
    new_habit: str  # "I will..."
    chain_items: List[Dict[str, str]] = []  # [{existing, new}, ...]
    success_count: int = 0
    total_attempts: int = 0
    chain_strength: int = 0  # 0-100
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HabitChainCreate(BaseModel):
    name: str
    existing_habit: str
    new_habit: str
    chain_items: Optional[List[Dict[str, str]]] = []

class HabitChainCompletion(BaseModel):
    chain_id: str
    success: bool  # Did you complete the chain?
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).date().isoformat())

@api_router.post("/habit-stacking", response_model=HabitChain)
async def create_habit_chain(data: HabitChainCreate, user_id: str = Depends(get_current_user)):
    """Create a habit chain"""
    chain = HabitChain(user_id=user_id, **data.model_dump())
    chain_dict = chain.model_dump()
    chain_dict['created_at'] = chain_dict['created_at'].isoformat()
    chain_dict['updated_at'] = chain_dict['updated_at'].isoformat()
    
    await db.habit_chains.insert_one(chain_dict)
    return chain

@api_router.get("/habit-stacking", response_model=List[HabitChain])
async def get_habit_chains(user_id: str = Depends(get_current_user)):
    """Get all habit chains"""
    chains = await db.habit_chains.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    for chain in chains:
        if isinstance(chain['created_at'], str):
            chain['created_at'] = datetime.fromisoformat(chain['created_at'])
        if isinstance(chain['updated_at'], str):
            chain['updated_at'] = datetime.fromisoformat(chain['updated_at'])
    return chains

@api_router.post("/habit-stacking/complete")
async def complete_habit_chain(data: HabitChainCompletion, user_id: str = Depends(get_current_user)):
    """Track habit chain completion"""
    chain = await db.habit_chains.find_one({"id": data.chain_id, "user_id": user_id})
    if not chain:
        raise HTTPException(status_code=404, detail="Chain not found")
    
    # Update counts
    new_success = chain.get('success_count', 0) + (1 if data.success else 0)
    new_total = chain.get('total_attempts', 0) + 1
    new_strength = int((new_success / new_total) * 100) if new_total > 0 else 0
    
    await db.habit_chains.update_one(
        {"id": data.chain_id, "user_id": user_id},
        {"$set": {
            "success_count": new_success,
            "total_attempts": new_total,
            "chain_strength": new_strength,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log completion
    await db.habit_chain_completions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "chain_id": data.chain_id,
        "success": data.success,
        "date": data.date,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Chain completion recorded", "chain_strength": new_strength}


# ============ JOURNEY MAP & TRANSFORMATION TIMELINE ============
class JourneyMilestone(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str
    category: str  # goal_achieved, habit_milestone, insight, breakthrough, challenge_overcome
    emotion: Optional[str] = None
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).date().isoformat())
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JourneyMilestoneCreate(BaseModel):
    title: str
    description: str
    category: str
    emotion: Optional[str] = None
    date: Optional[str] = None

@api_router.post("/journey/milestones", response_model=JourneyMilestone)
async def create_journey_milestone(data: JourneyMilestoneCreate, user_id: str = Depends(get_current_user)):
    """Create a journey milestone"""
    milestone_data = data.model_dump()
    # Set default date if not provided
    if milestone_data.get('date') is None:
        milestone_data['date'] = datetime.now(timezone.utc).date().isoformat()
    
    milestone = JourneyMilestone(user_id=user_id, **milestone_data)
    milestone_dict = milestone.model_dump()
    milestone_dict['created_at'] = milestone_dict['created_at'].isoformat()
    
    await db.journey_milestones.insert_one(milestone_dict)
    return milestone

@api_router.get("/journey/milestones", response_model=List[JourneyMilestone])
async def get_journey_milestones(user_id: str = Depends(get_current_user)):
    """Get all journey milestones"""
    milestones = await db.journey_milestones.find({"user_id": user_id}, {"_id": 0}).sort("date", -1).to_list(200)
    for milestone in milestones:
        if isinstance(milestone['created_at'], str):
            milestone['created_at'] = datetime.fromisoformat(milestone['created_at'])
    return milestones

@api_router.delete("/journey/milestones/{milestone_id}")
async def delete_journey_milestone(milestone_id: str, user_id: str = Depends(get_current_user)):
    """Delete a journey milestone"""
    result = await db.journey_milestones.delete_one({"id": milestone_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return {"message": "Milestone deleted"}


# ============ LEGACY MODE ============
class LegacyStatement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    legacy_text: str  # What mark will you leave?
    values: List[str] = []  # Core values
    impact_areas: List[str] = []  # Where you want to make impact
    future_self_letter: Optional[str] = None  # Letter to future generations
    mission_statement: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LegacyStatementCreate(BaseModel):
    legacy_text: str
    values: Optional[List[str]] = []
    impact_areas: Optional[List[str]] = []
    future_self_letter: Optional[str] = None
    mission_statement: Optional[str] = None

@api_router.post("/legacy", response_model=LegacyStatement)
async def create_legacy_statement(data: LegacyStatementCreate, user_id: str = Depends(get_current_user)):
    """Create or update legacy statement"""
    existing = await db.legacy_statements.find_one({"user_id": user_id})
    
    if existing:
        update_data = data.model_dump()
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.legacy_statements.update_one({"user_id": user_id}, {"$set": update_data})
        
        updated = await db.legacy_statements.find_one({"user_id": user_id}, {"_id": 0})
        if isinstance(updated['created_at'], str):
            updated['created_at'] = datetime.fromisoformat(updated['created_at'])
        if isinstance(updated['updated_at'], str):
            updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
        return LegacyStatement(**updated)
    else:
        legacy = LegacyStatement(user_id=user_id, **data.model_dump())
        legacy_dict = legacy.model_dump()
        legacy_dict['created_at'] = legacy_dict['created_at'].isoformat()
        legacy_dict['updated_at'] = legacy_dict['updated_at'].isoformat()
        
        await db.legacy_statements.insert_one(legacy_dict)
        return legacy

@api_router.get("/legacy", response_model=LegacyStatement)
async def get_legacy_statement(user_id: str = Depends(get_current_user)):
    """Get user's legacy statement"""
    legacy = await db.legacy_statements.find_one({"user_id": user_id}, {"_id": 0})
    if not legacy:
        raise HTTPException(status_code=404, detail="No legacy statement set")
    
    if isinstance(legacy['created_at'], str):
        legacy['created_at'] = datetime.fromisoformat(legacy['created_at'])
    if isinstance(legacy['updated_at'], str):
        legacy['updated_at'] = datetime.fromisoformat(legacy['updated_at'])
    return LegacyStatement(**legacy)


# ============ MORNING ALGORITHM ============
class MorningRoutine(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    routine_name: str
    philosophy: str  # hill, clear, holiday
    steps: List[Dict[str, Any]] = []  # [{step: str, duration_minutes: int, completed: bool}]
    total_duration: int = 0  # minutes
    streak: int = 0
    best_streak: int = 0
    last_completed: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MorningRoutineCreate(BaseModel):
    routine_name: str
    philosophy: str
    steps: List[Dict[str, Any]] = []
    total_duration: int = 0

class MorningRoutineCompletion(BaseModel):
    routine_id: str
    completed_steps: List[str] = []  # Step names that were completed
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).date().isoformat())

@api_router.post("/morning-algorithm", response_model=MorningRoutine)
async def create_morning_routine(data: MorningRoutineCreate, user_id: str = Depends(get_current_user)):
    """Create a morning routine"""
    routine = MorningRoutine(user_id=user_id, **data.model_dump())
    routine_dict = routine.model_dump()
    routine_dict['created_at'] = routine_dict['created_at'].isoformat()
    routine_dict['updated_at'] = routine_dict['updated_at'].isoformat()
    
    await db.morning_routines.insert_one(routine_dict)
    return routine

@api_router.get("/morning-algorithm", response_model=List[MorningRoutine])
async def get_morning_routines(user_id: str = Depends(get_current_user)):
    """Get all morning routines"""
    routines = await db.morning_routines.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    for routine in routines:
        if isinstance(routine['created_at'], str):
            routine['created_at'] = datetime.fromisoformat(routine['created_at'])
        if isinstance(routine['updated_at'], str):
            routine['updated_at'] = datetime.fromisoformat(routine['updated_at'])
    return routines

@api_router.post("/morning-algorithm/complete")
async def complete_morning_routine(data: MorningRoutineCompletion, user_id: str = Depends(get_current_user)):
    """Track morning routine completion"""
    routine = await db.morning_routines.find_one({"id": data.routine_id, "user_id": user_id})
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    # Calculate streak
    from datetime import datetime as dt
    today = dt.now(timezone.utc).date()
    last_completed = routine.get('last_completed')
    current_streak = routine.get('streak', 0)
    
    if last_completed:
        last_date = dt.fromisoformat(last_completed).date()
        if (today - last_date).days == 1:
            current_streak += 1
        elif (today - last_date).days == 0:
            pass  # Same day, don't increment
        else:
            current_streak = 1  # Streak broken
    else:
        current_streak = 1
    
    best_streak = max(routine.get('best_streak', 0), current_streak)
    
    await db.morning_routines.update_one(
        {"id": data.routine_id, "user_id": user_id},
        {"$set": {
            "streak": current_streak,
            "best_streak": best_streak,
            "last_completed": data.date,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log completion
    await db.morning_routine_completions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "routine_id": data.routine_id,
        "completed_steps": data.completed_steps,
        "date": data.date,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Routine completed", "streak": current_streak, "best_streak": best_streak}


# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "growth-mindset-api"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
