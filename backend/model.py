from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Define the SQLite database URL
DATABASE_URL = "sqlite:///students.db"

# Create a new SQLAlchemy engine instance
engine = create_engine(DATABASE_URL, echo=True)

# Create a base class for model definitions
Base = declarative_base()

# Define the Student model
class Student(Base):
    __tablename__ = 'students'

    uid = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, nullable=False)
    course = Column(String, nullable=False)
    transcription = Column(String, nullable=True)

Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()

# Adding data
def add_mock_data(session):
    # Mock data
    mock_data = [
        {'student_id': f'SID{7793}', 'course': 'Math', 'transcription': 'What is 5x5?'},
        {'student_id': f'SID{7793}', 'course': 'Math', 'transcription': 'What 8x5?'},
        {'student_id': f'SID{7793}', 'course': 'Math', 'transcription': 'What 6+7?'},
        {'student_id': f'SID{7793}', 'course': 'Science', 'transcription': 'What is photosynthesis?'},
        {'student_id': f'SID{6993}', 'course': 'History', 'transcription': 'When was World War II?'},
        {'student_id': f'SID{6993}', 'course': 'History', 'transcription': 'What were the main causes of WWII?'},
         {'student_id': f'SID{6993}', 'course': 'History', 'transcription': 'What countries were involved in WW II?'},
    ]

    for data in mock_data:
        student = Student(**data)
        session.add(student)

    session.commit()

add_mock_data(session)
