from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Text, DateTime, Boolean, JSON, select, update, delete, func
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get('DATABASE_URL', '')
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql+asyncpg://', 1)
elif DATABASE_URL.startswith('postgresql://'):
    DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://', 1)

if 'sslmode=' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split('?')[0]

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class UserModel(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    wisdom_notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class GoalModel(Base):
    __tablename__ = "goals"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(50), default="personal")
    principle: Mapped[str] = mapped_column(String(50), default="think_and_grow_rich")
    why: Mapped[str] = mapped_column(Text, default="")
    target_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    milestones: Mapped[List] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(20), default="active")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class HabitModel(Base):
    __tablename__ = "habits"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    frequency: Mapped[str] = mapped_column(String(20), default="daily")
    streak: Mapped[int] = mapped_column(Integer, default=0)
    best_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_completed: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    completion_dates: Mapped[List] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class VisionBoardItemModel(Base):
    __tablename__ = "vision_board_items"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class JournalEntryModel(Base):
    __tablename__ = "journal_entries"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    mood: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    gratitude: Mapped[List] = mapped_column(JSON, default=list)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ExerciseModel(Base):
    __tablename__ = "exercises"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    exercise_type: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[Dict] = mapped_column(JSON, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class RitualCompletionModel(Base):
    __tablename__ = "ritual_completions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    ritual_type: Mapped[str] = mapped_column(String(50), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class WisdomFavoriteModel(Base):
    __tablename__ = "wisdom_favorites"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    quote_id: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class IdentityStatementModel(Base):
    __tablename__ = "identity_statements"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    old_identity: Mapped[str] = mapped_column(Text, nullable=False)
    new_identity: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_count: Mapped[int] = mapped_column(Integer, default=0)
    strength_score: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class IdentityEvidenceModel(Base):
    __tablename__ = "identity_evidence"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    identity_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    evidence_text: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ObstacleModel(Base):
    __tablename__ = "obstacles"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    obstacle_text: Mapped[str] = mapped_column(Text, nullable=False)
    perception: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    action: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    will: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    transformed_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class BurningDesireModel(Base):
    __tablename__ = "burning_desires"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True, index=True)
    desire_text: Mapped[str] = mapped_column(Text, nullable=False)
    why_text: Mapped[str] = mapped_column(Text, nullable=False)
    vision_text: Mapped[str] = mapped_column(Text, nullable=False)
    intensity: Mapped[int] = mapped_column(Integer, default=10)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class DesireVisualizationModel(Base):
    __tablename__ = "desire_visualizations"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    desire_id: Mapped[str] = mapped_column(String(36), nullable=False)
    intensity_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    emotion: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class PremeditatioPracticeModel(Base):
    __tablename__ = "premeditatio_practices"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    scenario: Mapped[str] = mapped_column(Text, nullable=False)
    potential_obstacles: Mapped[List] = mapped_column(JSON, default=list)
    planned_responses: Mapped[List] = mapped_column(JSON, default=list)
    resilience_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    actual_outcome: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    lessons_learned: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class HabitChainModel(Base):
    __tablename__ = "habit_chains"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    existing_habit: Mapped[str] = mapped_column(Text, nullable=False)
    new_habit: Mapped[str] = mapped_column(Text, nullable=False)
    chain_items: Mapped[List] = mapped_column(JSON, default=list)
    success_count: Mapped[int] = mapped_column(Integer, default=0)
    total_attempts: Mapped[int] = mapped_column(Integer, default=0)
    chain_strength: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class HabitChainCompletionModel(Base):
    __tablename__ = "habit_chain_completions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    chain_id: Mapped[str] = mapped_column(String(36), nullable=False)
    success: Mapped[bool] = mapped_column(Boolean, nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class TwoMinuteRuleModel(Base):
    __tablename__ = "two_minute_rules"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    full_habit: Mapped[str] = mapped_column(Text, nullable=False)
    two_minute_version: Mapped[str] = mapped_column(Text, nullable=False)
    completion_dates: Mapped[List] = mapped_column(JSON, default=list)
    graduation_level: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class MastermindMemberModel(Base):
    __tablename__ = "mastermind_members"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    expertise: Mapped[str] = mapped_column(String(255), nullable=False)
    contribution: Mapped[str] = mapped_column(Text, nullable=False)
    is_virtual: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class MastermindMeetingModel(Base):
    __tablename__ = "mastermind_meetings"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    member_id: Mapped[str] = mapped_column(String(36), nullable=False)
    topic: Mapped[str] = mapped_column(Text, nullable=False)
    insights: Mapped[str] = mapped_column(Text, nullable=False)
    action_items: Mapped[List] = mapped_column(JSON, default=list)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30


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

class Goal(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    title: str
    description: str = ""
    category: str = "personal"
    principle: str = "think_and_grow_rich"
    why: str = ""
    target_date: Optional[str] = None
    milestones: List[Dict[str, Any]] = []
    status: str = "active"
    progress: int = 0
    created_at: datetime
    updated_at: datetime

class HabitCreate(BaseModel):
    name: str
    description: str
    frequency: str = "daily"

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None

class Habit(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    name: str
    description: str
    frequency: str
    streak: int = 0
    best_streak: int = 0
    last_completed: Optional[str] = None
    completion_dates: List[str] = []
    created_at: datetime

class VisionBoardItemCreate(BaseModel):
    type: str
    content: str
    position: Optional[Dict[str, Any]] = None

class VisionBoardItem(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    type: str
    content: str
    position: Optional[Dict[str, Any]] = None
    created_at: datetime

class JournalEntryCreate(BaseModel):
    content: str
    mood: Optional[str] = None
    gratitude: Optional[List[str]] = []

class JournalEntry(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    content: str
    mood: Optional[str] = None
    gratitude: List[str] = []
    date: str
    created_at: datetime

class ExerciseCreate(BaseModel):
    exercise_type: str
    content: Dict[str, Any]

class Exercise(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    exercise_type: str
    content: Dict[str, Any]
    completed: bool = False
    date: str
    created_at: datetime

class RitualCompleteRequest(BaseModel):
    ritual_type: str
    completed_at: str

class WisdomFavoriteCreate(BaseModel):
    quote_id: str

class WisdomNotificationPreference(BaseModel):
    enabled: bool

class IdentityStatementCreate(BaseModel):
    old_identity: str
    new_identity: str

class IdentityStatement(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    old_identity: str
    new_identity: str
    evidence_count: int = 0
    strength_score: int = 0
    created_at: datetime
    updated_at: datetime

class IdentityEvidenceCreate(BaseModel):
    identity_id: str
    evidence_text: str

class IdentityEvidence(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    identity_id: str
    evidence_text: str
    date: str
    created_at: datetime

class ObstacleCreate(BaseModel):
    obstacle_text: str

class ObstacleUpdate(BaseModel):
    perception: Optional[str] = None
    action: Optional[str] = None
    will: Optional[str] = None
    status: Optional[str] = None

class Obstacle(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    obstacle_text: str
    perception: Optional[str] = None
    action: Optional[str] = None
    will: Optional[str] = None
    status: str = "active"
    transformed_at: Optional[str] = None
    created_at: datetime
    updated_at: datetime

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

class BurningDesire(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    desire_text: str
    why_text: str
    vision_text: str
    intensity: int = 10
    created_at: datetime
    updated_at: datetime

class DesireVisualizationCreate(BaseModel):
    desire_id: str
    intensity_rating: int
    emotion: str
    notes: Optional[str] = None

class PremeditatioPracticeCreate(BaseModel):
    scenario: str
    potential_obstacles: List[str] = []
    planned_responses: List[str] = []

class PremeditatioPracticeUpdate(BaseModel):
    resilience_score: Optional[int] = None
    actual_outcome: Optional[str] = None
    lessons_learned: Optional[str] = None

class PremeditatioPractice(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    scenario: str
    potential_obstacles: List[str] = []
    planned_responses: List[str] = []
    resilience_score: Optional[int] = None
    actual_outcome: Optional[str] = None
    lessons_learned: Optional[str] = None
    date: str
    created_at: datetime
    updated_at: datetime

class HabitChainCreate(BaseModel):
    name: str
    existing_habit: str
    new_habit: str
    chain_items: Optional[List[Dict[str, str]]] = []

class HabitChain(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    name: str
    existing_habit: str
    new_habit: str
    chain_items: List[Dict[str, str]] = []
    success_count: int = 0
    total_attempts: int = 0
    chain_strength: int = 0
    created_at: datetime
    updated_at: datetime

class HabitChainCompletionData(BaseModel):
    chain_id: str
    success: bool

class TwoMinuteRuleCreate(BaseModel):
    full_habit: str
    two_minute_version: str

class TwoMinuteRule(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    user_id: str
    full_habit: str
    two_minute_version: str
    completion_dates: List[str] = []
    graduation_level: int = 0
    created_at: datetime
    updated_at: datetime

class MastermindMemberCreate(BaseModel):
    name: str
    expertise: str
    contribution: str
    is_virtual: bool = False

class MastermindMeetingCreate(BaseModel):
    member_id: str
    topic: str
    insights: str
    action_items: List[str] = []


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    return jwt.encode({"user_id": user_id, "exp": expiration}, JWT_SECRET, algorithm=JWT_ALGORITHM)

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

async def get_db():
    async with async_session() as session:
        yield session


@api_router.post("/auth/register")
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = UserModel(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        password_hash=hash_password(user_data.password)
    )
    db.add(user)
    await db.commit()
    
    token = create_token(user_id)
    return {"token": token, "user": {"id": user_id, "email": user_data.email, "name": user_data.name}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == credentials.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}


@api_router.post("/goals", response_model=Goal)
async def create_goal(goal_data: GoalCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    milestones = goal_data.milestones or []
    progress = 0
    if milestones:
        completed_count = sum(1 for m in milestones if m.get('completed', False))
        progress = int((completed_count / len(milestones)) * 100) if milestones else 0
    
    goal = GoalModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=goal_data.title,
        description=goal_data.description,
        category=goal_data.category,
        principle=goal_data.principle,
        why=goal_data.why,
        target_date=goal_data.target_date,
        milestones=milestones,
        progress=progress
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return Goal.model_validate(goal)

@api_router.get("/goals", response_model=List[Goal])
async def get_goals(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GoalModel).where(GoalModel.user_id == user_id))
    goals = result.scalars().all()
    return [Goal.model_validate(g) for g in goals]

@api_router.put("/goals/{goal_id}", response_model=Goal)
async def update_goal(goal_id: str, goal_update: GoalUpdate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GoalModel).where(GoalModel.id == goal_id, GoalModel.user_id == user_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = {k: v for k, v in goal_update.model_dump().items() if v is not None}
    
    if 'milestones' in update_data:
        milestones = update_data['milestones']
        if milestones:
            completed_count = sum(1 for m in milestones if m.get('completed', False))
            update_data['progress'] = int((completed_count / len(milestones)) * 100)
            if completed_count == len(milestones) and len(milestones) > 0:
                update_data['status'] = 'completed'
    
    update_data['updated_at'] = datetime.now(timezone.utc)
    
    for key, value in update_data.items():
        setattr(goal, key, value)
    
    await db.commit()
    await db.refresh(goal)
    return Goal.model_validate(goal)

@api_router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GoalModel).where(GoalModel.id == goal_id, GoalModel.user_id == user_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    await db.delete(goal)
    await db.commit()
    return {"message": "Goal deleted"}


@api_router.post("/habits", response_model=Habit)
async def create_habit(habit_data: HabitCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    habit = HabitModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        name=habit_data.name,
        description=habit_data.description,
        frequency=habit_data.frequency
    )
    db.add(habit)
    await db.commit()
    await db.refresh(habit)
    return Habit.model_validate(habit)

@api_router.get("/habits", response_model=List[Habit])
async def get_habits(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HabitModel).where(HabitModel.user_id == user_id))
    habits = result.scalars().all()
    return [Habit.model_validate(h) for h in habits]

@api_router.post("/habits/{habit_id}/complete")
async def complete_habit(habit_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HabitModel).where(HabitModel.id == habit_id, HabitModel.user_id == user_id))
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    today = datetime.now(timezone.utc).date().isoformat()
    completion_dates = list(habit.completion_dates or [])
    streak = habit.streak or 0
    
    if today not in completion_dates:
        completion_dates.append(today)
        sorted_dates = sorted(completion_dates, reverse=True)
        streak = 1
        for i in range(len(sorted_dates) - 1):
            current = datetime.fromisoformat(sorted_dates[i]).date()
            previous = datetime.fromisoformat(sorted_dates[i + 1]).date()
            if (current - previous).days == 1:
                streak += 1
            else:
                break
        
        best_streak = max(habit.best_streak or 0, streak)
        habit.completion_dates = completion_dates
        habit.last_completed = today
        habit.streak = streak
        habit.best_streak = best_streak
        await db.commit()
    
    return {"message": "Habit completed", "streak": streak}

@api_router.put("/habits/{habit_id}")
async def update_habit(habit_id: str, habit_update: HabitUpdate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HabitModel).where(HabitModel.id == habit_id, HabitModel.user_id == user_id))
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    update_data = {k: v for k, v in habit_update.model_dump().items() if v is not None}
    for key, value in update_data.items():
        setattr(habit, key, value)
    
    await db.commit()
    await db.refresh(habit)
    return Habit.model_validate(habit)

@api_router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HabitModel).where(HabitModel.id == habit_id, HabitModel.user_id == user_id))
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    await db.delete(habit)
    await db.commit()
    return {"message": "Habit deleted"}


@api_router.post("/vision-board", response_model=VisionBoardItem)
async def create_vision_item(item_data: VisionBoardItemCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    item = VisionBoardItemModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        type=item_data.type,
        content=item_data.content,
        position=item_data.position
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return VisionBoardItem.model_validate(item)

@api_router.get("/vision-board", response_model=List[VisionBoardItem])
async def get_vision_board(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VisionBoardItemModel).where(VisionBoardItemModel.user_id == user_id))
    items = result.scalars().all()
    return [VisionBoardItem.model_validate(i) for i in items]

@api_router.delete("/vision-board/{item_id}")
async def delete_vision_item(item_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VisionBoardItemModel).where(VisionBoardItemModel.id == item_id, VisionBoardItemModel.user_id == user_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.delete(item)
    await db.commit()
    return {"message": "Item deleted"}


@api_router.post("/journal", response_model=JournalEntry)
async def create_journal_entry(entry_data: JournalEntryCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    entry = JournalEntryModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        content=entry_data.content,
        mood=entry_data.mood,
        gratitude=entry_data.gratitude or [],
        date=datetime.now(timezone.utc).date().isoformat()
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return JournalEntry.model_validate(entry)

@api_router.get("/journal", response_model=List[JournalEntry])
async def get_journal_entries(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JournalEntryModel).where(JournalEntryModel.user_id == user_id).order_by(JournalEntryModel.date.desc()))
    entries = result.scalars().all()
    return [JournalEntry.model_validate(e) for e in entries]


@api_router.post("/exercises", response_model=Exercise)
async def create_exercise(exercise_data: ExerciseCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    exercise = ExerciseModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        exercise_type=exercise_data.exercise_type,
        content=exercise_data.content,
        completed=True,
        date=datetime.now(timezone.utc).date().isoformat()
    )
    db.add(exercise)
    await db.commit()
    await db.refresh(exercise)
    return Exercise.model_validate(exercise)

@api_router.get("/exercises", response_model=List[Exercise])
async def get_exercises(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExerciseModel).where(ExerciseModel.user_id == user_id).order_by(ExerciseModel.date.desc()))
    exercises = result.scalars().all()
    return [Exercise.model_validate(e) for e in exercises]


@api_router.get("/analytics/overview")
async def get_analytics(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    goals_result = await db.execute(select(GoalModel).where(GoalModel.user_id == user_id))
    goals = goals_result.scalars().all()
    
    habits_result = await db.execute(select(HabitModel).where(HabitModel.user_id == user_id))
    habits = habits_result.scalars().all()
    
    journal_result = await db.execute(select(JournalEntryModel).where(JournalEntryModel.user_id == user_id))
    journal_entries = journal_result.scalars().all()
    
    exercises_result = await db.execute(select(ExerciseModel).where(ExerciseModel.user_id == user_id))
    exercises = exercises_result.scalars().all()
    
    total_goals = len(goals)
    completed_goals = len([g for g in goals if g.status == 'completed'])
    active_goals = len([g for g in goals if g.status == 'active'])
    
    total_habits = len(habits)
    max_streak = max([h.streak or 0 for h in habits], default=0)
    best_streak_ever = max([h.best_streak or 0 for h in habits], default=0)
    avg_streak = sum([h.streak or 0 for h in habits]) / total_habits if total_habits > 0 else 0
    
    journal_count = len(journal_entries)
    exercise_count = len(exercises)
    
    today = datetime.now(timezone.utc).date()
    last_7_days = [(today - timedelta(days=i)).isoformat() for i in range(7)]
    
    habit_completions = []
    for date in last_7_days:
        completed_today = sum(1 for h in habits if date in (h.completion_dates or []))
        habit_completions.append({"date": date, "completed": completed_today, "total": total_habits})
    
    total_completions = sum(len(h.completion_dates or []) for h in habits)
    
    goals_by_category = {}
    for g in goals:
        cat = g.category or 'personal'
        if cat not in goals_by_category:
            goals_by_category[cat] = {'total': 0, 'completed': 0}
        goals_by_category[cat]['total'] += 1
        if g.status == 'completed':
            goals_by_category[cat]['completed'] += 1
    
    journal_streak = 0
    if journal_entries:
        sorted_entries = sorted(journal_entries, key=lambda x: x.date or '', reverse=True)
        check_date = today
        for entry in sorted_entries:
            if entry.date == check_date.isoformat():
                journal_streak += 1
                check_date -= timedelta(days=1)
            elif entry.date < check_date.isoformat():
                break
    
    mood_counts = {}
    for entry in journal_entries:
        mood = entry.mood or 'reflective'
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


@api_router.post("/rituals/complete")
async def complete_ritual(ritual_data: RitualCompleteRequest, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    ritual = RitualCompletionModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        ritual_type=ritual_data.ritual_type,
        completed_at=datetime.fromisoformat(ritual_data.completed_at.replace('Z', '+00:00'))
    )
    db.add(ritual)
    await db.commit()
    return {"message": "Ritual completed", "id": ritual.id}

@api_router.get("/rituals/completed")
async def get_completed_rituals(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RitualCompletionModel)
        .where(RitualCompletionModel.user_id == user_id)
        .order_by(RitualCompletionModel.completed_at.desc())
        .limit(50)
    )
    rituals = result.scalars().all()
    return [{"id": r.id, "user_id": r.user_id, "ritual_type": r.ritual_type, "completed_at": r.completed_at.isoformat()} for r in rituals]


@api_router.post("/wisdom/favorites")
async def add_wisdom_favorite(favorite_data: WisdomFavoriteCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WisdomFavoriteModel)
        .where(WisdomFavoriteModel.user_id == user_id, WisdomFavoriteModel.quote_id == favorite_data.quote_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")
    
    favorite = WisdomFavoriteModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        quote_id=favorite_data.quote_id
    )
    db.add(favorite)
    await db.commit()
    return {"message": "Added to favorites", "id": favorite.id}

@api_router.get("/wisdom/favorites")
async def get_wisdom_favorites(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WisdomFavoriteModel)
        .where(WisdomFavoriteModel.user_id == user_id)
        .order_by(WisdomFavoriteModel.created_at.desc())
    )
    favorites = result.scalars().all()
    return [{"id": f.id, "user_id": f.user_id, "quote_id": f.quote_id, "created_at": f.created_at.isoformat()} for f in favorites]

@api_router.delete("/wisdom/favorites/{quote_id}")
async def remove_wisdom_favorite(quote_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WisdomFavoriteModel)
        .where(WisdomFavoriteModel.user_id == user_id, WisdomFavoriteModel.quote_id == quote_id)
    )
    favorite = result.scalar_one_or_none()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    await db.delete(favorite)
    await db.commit()
    return {"message": "Removed from favorites"}

@api_router.post("/wisdom/notifications")
async def update_wisdom_notifications(prefs: WisdomNotificationPreference, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        user.wisdom_notifications = prefs.enabled
        await db.commit()
    return {"message": "Notification preferences updated", "enabled": prefs.enabled}


@api_router.post("/identity/statements", response_model=IdentityStatement)
async def create_identity_statement(data: IdentityStatementCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    identity = IdentityStatementModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        old_identity=data.old_identity,
        new_identity=data.new_identity
    )
    db.add(identity)
    await db.commit()
    await db.refresh(identity)
    return IdentityStatement.model_validate(identity)

@api_router.get("/identity/statements", response_model=List[IdentityStatement])
async def get_identity_statements(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(IdentityStatementModel).where(IdentityStatementModel.user_id == user_id))
    statements = result.scalars().all()
    return [IdentityStatement.model_validate(s) for s in statements]

@api_router.post("/identity/evidence", response_model=IdentityEvidence)
async def add_identity_evidence(data: IdentityEvidenceCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    evidence = IdentityEvidenceModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        identity_id=data.identity_id,
        evidence_text=data.evidence_text,
        date=datetime.now(timezone.utc).date().isoformat()
    )
    db.add(evidence)
    await db.commit()
    
    count_result = await db.execute(
        select(func.count()).select_from(IdentityEvidenceModel)
        .where(IdentityEvidenceModel.user_id == user_id, IdentityEvidenceModel.identity_id == data.identity_id)
    )
    evidence_count = count_result.scalar()
    strength_score = min(100, evidence_count * 2)
    
    stmt_result = await db.execute(
        select(IdentityStatementModel)
        .where(IdentityStatementModel.id == data.identity_id, IdentityStatementModel.user_id == user_id)
    )
    statement = stmt_result.scalar_one_or_none()
    if statement:
        statement.evidence_count = evidence_count
        statement.strength_score = strength_score
        statement.updated_at = datetime.now(timezone.utc)
        await db.commit()
    
    await db.refresh(evidence)
    return IdentityEvidence.model_validate(evidence)

@api_router.get("/identity/evidence/{identity_id}")
async def get_identity_evidence(identity_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(IdentityEvidenceModel)
        .where(IdentityEvidenceModel.user_id == user_id, IdentityEvidenceModel.identity_id == identity_id)
        .order_by(IdentityEvidenceModel.created_at.desc())
    )
    evidence_list = result.scalars().all()
    return [{"id": e.id, "user_id": e.user_id, "identity_id": e.identity_id, "evidence_text": e.evidence_text, "date": e.date, "created_at": e.created_at.isoformat()} for e in evidence_list]


@api_router.post("/obstacles", response_model=Obstacle)
async def create_obstacle(data: ObstacleCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    obstacle = ObstacleModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        obstacle_text=data.obstacle_text
    )
    db.add(obstacle)
    await db.commit()
    await db.refresh(obstacle)
    return Obstacle.model_validate(obstacle)

@api_router.get("/obstacles", response_model=List[Obstacle])
async def get_obstacles(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ObstacleModel)
        .where(ObstacleModel.user_id == user_id)
        .order_by(ObstacleModel.created_at.desc())
    )
    obstacles = result.scalars().all()
    return [Obstacle.model_validate(o) for o in obstacles]

@api_router.put("/obstacles/{obstacle_id}", response_model=Obstacle)
async def update_obstacle(obstacle_id: str, data: ObstacleUpdate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ObstacleModel).where(ObstacleModel.id == obstacle_id, ObstacleModel.user_id == user_id))
    obstacle = result.scalar_one_or_none()
    if not obstacle:
        raise HTTPException(status_code=404, detail="Obstacle not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    perception = update_data.get('perception') or obstacle.perception
    action = update_data.get('action') or obstacle.action
    will = update_data.get('will') or obstacle.will
    
    if perception and action and will and obstacle.status != 'transformed':
        update_data['status'] = 'transformed'
        update_data['transformed_at'] = datetime.now(timezone.utc).isoformat()
    
    update_data['updated_at'] = datetime.now(timezone.utc)
    
    for key, value in update_data.items():
        setattr(obstacle, key, value)
    
    await db.commit()
    await db.refresh(obstacle)
    return Obstacle.model_validate(obstacle)

@api_router.delete("/obstacles/{obstacle_id}")
async def delete_obstacle(obstacle_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ObstacleModel).where(ObstacleModel.id == obstacle_id, ObstacleModel.user_id == user_id))
    obstacle = result.scalar_one_or_none()
    if not obstacle:
        raise HTTPException(status_code=404, detail="Obstacle not found")
    await db.delete(obstacle)
    await db.commit()
    return {"message": "Obstacle deleted"}


@api_router.post("/burning-desire", response_model=BurningDesire)
async def create_burning_desire(data: BurningDesireCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BurningDesireModel).where(BurningDesireModel.user_id == user_id))
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.desire_text = data.desire_text
        existing.why_text = data.why_text
        existing.vision_text = data.vision_text
        existing.intensity = data.intensity
        existing.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(existing)
        return BurningDesire.model_validate(existing)
    else:
        desire = BurningDesireModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            desire_text=data.desire_text,
            why_text=data.why_text,
            vision_text=data.vision_text,
            intensity=data.intensity
        )
        db.add(desire)
        await db.commit()
        await db.refresh(desire)
        return BurningDesire.model_validate(desire)

@api_router.get("/burning-desire", response_model=BurningDesire)
async def get_burning_desire(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BurningDesireModel).where(BurningDesireModel.user_id == user_id))
    desire = result.scalar_one_or_none()
    if not desire:
        raise HTTPException(status_code=404, detail="No burning desire set")
    return BurningDesire.model_validate(desire)

@api_router.post("/burning-desire/visualizations")
async def create_visualization(data: DesireVisualizationCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    viz = DesireVisualizationModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        desire_id=data.desire_id,
        intensity_rating=data.intensity_rating,
        emotion=data.emotion,
        notes=data.notes,
        date=datetime.now(timezone.utc).date().isoformat()
    )
    db.add(viz)
    await db.commit()
    return {"id": viz.id, "user_id": viz.user_id, "desire_id": viz.desire_id, "intensity_rating": viz.intensity_rating, "emotion": viz.emotion, "notes": viz.notes, "date": viz.date, "created_at": viz.created_at.isoformat()}

@api_router.get("/burning-desire/visualizations")
async def get_visualizations(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DesireVisualizationModel)
        .where(DesireVisualizationModel.user_id == user_id)
        .order_by(DesireVisualizationModel.created_at.desc())
        .limit(30)
    )
    visualizations = result.scalars().all()
    return [{"id": v.id, "user_id": v.user_id, "desire_id": v.desire_id, "intensity_rating": v.intensity_rating, "emotion": v.emotion, "notes": v.notes, "date": v.date, "created_at": v.created_at.isoformat()} for v in visualizations]


@api_router.post("/premeditatio", response_model=PremeditatioPractice)
async def create_premeditatio(data: PremeditatioPracticeCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    practice = PremeditatioPracticeModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        scenario=data.scenario,
        potential_obstacles=data.potential_obstacles,
        planned_responses=data.planned_responses,
        date=datetime.now(timezone.utc).date().isoformat()
    )
    db.add(practice)
    await db.commit()
    await db.refresh(practice)
    return PremeditatioPractice.model_validate(practice)

@api_router.get("/premeditatio", response_model=List[PremeditatioPractice])
async def get_premeditatio_practices(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PremeditatioPracticeModel)
        .where(PremeditatioPracticeModel.user_id == user_id)
        .order_by(PremeditatioPracticeModel.created_at.desc())
    )
    practices = result.scalars().all()
    return [PremeditatioPractice.model_validate(p) for p in practices]

@api_router.put("/premeditatio/{practice_id}", response_model=PremeditatioPractice)
async def update_premeditatio(practice_id: str, data: PremeditatioPracticeUpdate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PremeditatioPracticeModel).where(PremeditatioPracticeModel.id == practice_id, PremeditatioPracticeModel.user_id == user_id))
    practice = result.scalar_one_or_none()
    if not practice:
        raise HTTPException(status_code=404, detail="Practice not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc)
    
    for key, value in update_data.items():
        setattr(practice, key, value)
    
    await db.commit()
    await db.refresh(practice)
    return PremeditatioPractice.model_validate(practice)


@api_router.post("/habit-stacking", response_model=HabitChain)
async def create_habit_chain(data: HabitChainCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    chain = HabitChainModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        name=data.name,
        existing_habit=data.existing_habit,
        new_habit=data.new_habit,
        chain_items=data.chain_items or []
    )
    db.add(chain)
    await db.commit()
    await db.refresh(chain)
    return HabitChain.model_validate(chain)

@api_router.get("/habit-stacking", response_model=List[HabitChain])
async def get_habit_chains(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HabitChainModel).where(HabitChainModel.user_id == user_id))
    chains = result.scalars().all()
    return [HabitChain.model_validate(c) for c in chains]

@api_router.post("/habit-stacking/{chain_id}/complete")
async def complete_habit_chain(chain_id: str, data: HabitChainCompletionData, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HabitChainModel).where(HabitChainModel.id == chain_id, HabitChainModel.user_id == user_id))
    chain = result.scalar_one_or_none()
    if not chain:
        raise HTTPException(status_code=404, detail="Chain not found")
    
    completion = HabitChainCompletionModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        chain_id=chain_id,
        success=data.success,
        date=datetime.now(timezone.utc).date().isoformat()
    )
    db.add(completion)
    
    chain.total_attempts = (chain.total_attempts or 0) + 1
    if data.success:
        chain.success_count = (chain.success_count or 0) + 1
    
    chain.chain_strength = int((chain.success_count / chain.total_attempts) * 100) if chain.total_attempts > 0 else 0
    chain.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    return {"message": "Chain completion recorded", "chain_strength": chain.chain_strength}

@api_router.delete("/habit-stacking/{chain_id}")
async def delete_habit_chain(chain_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HabitChainModel).where(HabitChainModel.id == chain_id, HabitChainModel.user_id == user_id))
    chain = result.scalar_one_or_none()
    if not chain:
        raise HTTPException(status_code=404, detail="Chain not found")
    await db.delete(chain)
    await db.commit()
    return {"message": "Chain deleted"}


@api_router.post("/two-minute-rule", response_model=TwoMinuteRule)
async def create_two_minute_rule(data: TwoMinuteRuleCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rule = TwoMinuteRuleModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        full_habit=data.full_habit,
        two_minute_version=data.two_minute_version
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return TwoMinuteRule.model_validate(rule)

@api_router.get("/two-minute-rule", response_model=List[TwoMinuteRule])
async def get_two_minute_rules(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TwoMinuteRuleModel).where(TwoMinuteRuleModel.user_id == user_id))
    rules = result.scalars().all()
    return [TwoMinuteRule.model_validate(r) for r in rules]

@api_router.post("/two-minute-rule/{rule_id}/complete")
async def complete_two_minute_rule(rule_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TwoMinuteRuleModel).where(TwoMinuteRuleModel.id == rule_id, TwoMinuteRuleModel.user_id == user_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    today = datetime.now(timezone.utc).date().isoformat()
    completion_dates = list(rule.completion_dates or [])
    
    if today not in completion_dates:
        completion_dates.append(today)
        rule.completion_dates = completion_dates
        rule.graduation_level = min(5, len(completion_dates) // 7)
        rule.updated_at = datetime.now(timezone.utc)
        await db.commit()
    
    return {"message": "Rule completed", "graduation_level": rule.graduation_level}

@api_router.delete("/two-minute-rule/{rule_id}")
async def delete_two_minute_rule(rule_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TwoMinuteRuleModel).where(TwoMinuteRuleModel.id == rule_id, TwoMinuteRuleModel.user_id == user_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    await db.delete(rule)
    await db.commit()
    return {"message": "Rule deleted"}


@api_router.post("/mastermind/members")
async def create_mastermind_member(data: MastermindMemberCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member = MastermindMemberModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        name=data.name,
        expertise=data.expertise,
        contribution=data.contribution,
        is_virtual=data.is_virtual
    )
    db.add(member)
    await db.commit()
    return {"id": member.id, "user_id": member.user_id, "name": member.name, "expertise": member.expertise, "contribution": member.contribution, "is_virtual": member.is_virtual, "created_at": member.created_at.isoformat()}

@api_router.get("/mastermind/members")
async def get_mastermind_members(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MastermindMemberModel).where(MastermindMemberModel.user_id == user_id))
    members = result.scalars().all()
    return [{"id": m.id, "user_id": m.user_id, "name": m.name, "expertise": m.expertise, "contribution": m.contribution, "is_virtual": m.is_virtual, "created_at": m.created_at.isoformat()} for m in members]

@api_router.delete("/mastermind/members/{member_id}")
async def delete_mastermind_member(member_id: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MastermindMemberModel).where(MastermindMemberModel.id == member_id, MastermindMemberModel.user_id == user_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    await db.delete(member)
    await db.commit()
    return {"message": "Member deleted"}

@api_router.post("/mastermind/meetings")
async def create_mastermind_meeting(data: MastermindMeetingCreate, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    meeting = MastermindMeetingModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        member_id=data.member_id,
        topic=data.topic,
        insights=data.insights,
        action_items=data.action_items,
        date=datetime.now(timezone.utc).date().isoformat()
    )
    db.add(meeting)
    await db.commit()
    return {"id": meeting.id, "user_id": meeting.user_id, "member_id": meeting.member_id, "topic": meeting.topic, "insights": meeting.insights, "action_items": meeting.action_items, "date": meeting.date, "created_at": meeting.created_at.isoformat()}

@api_router.get("/mastermind/meetings")
async def get_mastermind_meetings(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MastermindMeetingModel)
        .where(MastermindMeetingModel.user_id == user_id)
        .order_by(MastermindMeetingModel.created_at.desc())
    )
    meetings = result.scalars().all()
    return [{"id": m.id, "user_id": m.user_id, "member_id": m.member_id, "topic": m.topic, "insights": m.insights, "action_items": m.action_items, "date": m.date, "created_at": m.created_at.isoformat()} for m in meetings]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
