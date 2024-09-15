import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from model import Student

MODEL_ID = "8w6yyp2q"
BASETEN_API_KEY = "YMKFudUr.FcjOTi13DlaR3ZtCbBIumoXeqFJy25yx"

# Define the SQLite database URL
DATABASE_URL = "sqlite:///students.db"

# Create a new SQLAlchemy engine instance
engine = create_engine(DATABASE_URL, echo=True)

Session = sessionmaker(bind=engine)
session = Session()

# Filter data by student_id and course
def get_student_data(student_id, course, session):
    return session.query(Student).filter_by(student_id=student_id, course=course).all()

# Format the data for the AI model
def format_data_for_ai(students_data):
    formatted_data = []
    for student in students_data:
        formatted_data.append({
            "student_id": student.student_id,
            "course": student.course,
            "transcription": student.transcription
        })
    return formatted_data

# Get teacher input for student_id and course
student_id_input = input("Enter the student's ID: ")
course_input = input("Enter the course name: ")

# Filter by teacher's input
filtered_students_data = get_student_data(student_id_input, course_input, session)

# Check if data exists
if filtered_students_data:
    # Join transcriptions with clear separation and context
    transcriptions = "\n".join([f"Response {i+1}: {student.transcription}" for i, student in enumerate(filtered_students_data)])

    # Define the messages to be sent to the model
    messages = [
        {"role": "system", "content": f"You are an AI model that can read data from a database. The student with ID {student_id_input} is studying {course_input}. Below are their responses to the AI's guided questions:\n{transcriptions}."},
        {"role": "user", "content": "What are this student's weaknesses?"},
        {"role": "system", "content": f"The student has provided the following responses:\n{transcriptions}. Use this data to suggest how the teacher can help improve their understanding."},
        {"role": "user", "content": "What strategies should the teacher use to help the student improve? List 1-3 strategies."}
    ]

    # Define the payload for the API request
    payload = {
        "messages": messages,
        "stream": True,
        "max_tokens": 2048,
        "temperature": 0.9
    }

    # Call the model endpoint
    res = requests.post(
        f"https://model-{MODEL_ID}.api.baseten.co/production/predict",
        headers={"Authorization": f"Api-Key {BASETEN_API_KEY}"},
        json=payload,
        stream=True
    )

    # Print the generated tokens (feedback)
    print(res.text)

else:
    print("No data found for the given student_id and course.")
