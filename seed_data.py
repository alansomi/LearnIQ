"""
Seed data for the recommender demo.

RESOURCES below are real, currently-live learning resources (official docs,
Coursera, Kaggle Learn, freeCodeCamp, Hugging Face, etc.) — every `url` is a
genuine page you can open. This is a starting catalog of ~27 items across
four resource types and eight topics; see the README for how to grow this
via the YouTube/dev.to/GitHub APIs mentioned in the write-up.

DEMO_STUDENTS + the synthetic interactions generated below exist only so the
collaborative-filtering half of the hybrid has something to learn from on
first run. `seed_if_empty()` only runs if the tables are empty, so it never
overwrites real student data once your app has real users.
"""
import random

from database import get_session, Resource, Student, Interaction, new_id

RESOURCES = [
    dict(id="R01", title="Python Full Course for Beginners", topic="Python", type="Video",
         difficulty="Beginner", tags="python basics syntax variables loops functions",
         description="A complete beginner-friendly walkthrough of core Python syntax, control flow, and functions.",
         url="https://www.freecodecamp.org/news/python-programming-course", source="freeCodeCamp", rating=4.7),
    dict(id="R02", title="The Python Tutorial (Official Docs)", topic="Python", type="Tutorial",
         difficulty="Beginner", tags="python official tutorial data structures modules",
         description="Python's own official tutorial covering syntax, data structures, and modules end to end.",
         url="https://docs.python.org/3/tutorial/", source="python.org", rating=4.6),
    dict(id="R03", title="Kaggle: Learn Python", topic="Python", type="Tutorial",
         difficulty="Beginner", tags="python interactive notebook hands-on exercises",
         description="Short, interactive, browser-based Python lessons with exercises after every lesson.",
         url="https://www.kaggle.com/learn/python", source="Kaggle", rating=4.5),
    dict(id="R04", title="Google's Python Class", topic="Python", type="Article",
         difficulty="Intermediate", tags="python exercises lecture notes",
         description="Lecture notes and exercises for people with a little programming experience wanting to learn Python.",
         url="https://developers.google.com/edu/python", source="Google", rating=4.4),
    dict(id="R05", title="20 Beginner Python Projects", topic="Python", type="Project",
         difficulty="Beginner", tags="python projects practice portfolio build",
         description="Twenty small, practical Python projects to build hands-on coding confidence.",
         url="https://www.freecodecamp.org/news/20-beginner-python-projects/", source="freeCodeCamp", rating=4.5),
    dict(id="R27", title="Real Python Tutorials", topic="Python", type="Article",
         difficulty="Intermediate", tags="python tutorials articles intermediate advanced",
         description="In-depth written tutorials on intermediate and advanced Python topics and best practices.",
         url="https://realpython.com/", source="Real Python", rating=4.6),

    dict(id="R06", title="MDN: Learn Web Development", topic="Web Development", type="Tutorial",
         difficulty="Beginner", tags="html css javascript web fundamentals",
         description="Mozilla's structured curriculum covering HTML, CSS, and JavaScript fundamentals.",
         url="https://developer.mozilla.org/en-US/docs/Learn", source="MDN", rating=4.7),
    dict(id="R07", title="React — Official Tutorial", topic="Web Development", type="Tutorial",
         difficulty="Intermediate", tags="react javascript frontend components hooks",
         description="The official React documentation's guided introduction to components, state, and hooks.",
         url="https://react.dev/learn", source="react.dev", rating=4.7),
    dict(id="R08", title="FastAPI Official Tutorial", topic="Web Development", type="Tutorial",
         difficulty="Intermediate", tags="python fastapi rest api backend async",
         description="Step-by-step guide to building REST APIs in Python with FastAPI, from path params to auth.",
         url="https://fastapi.tiangolo.com/tutorial/", source="FastAPI", rating=4.8),
    dict(id="R09", title="freeCodeCamp Curriculum", topic="Web Development", type="Project",
         difficulty="Beginner", tags="web development full stack certification projects",
         description="Free, project-based certifications covering responsive web design through backend development.",
         url="https://www.freecodecamp.org/learn/", source="freeCodeCamp", rating=4.6),

    dict(id="R10", title="Machine Learning — Andrew Ng (Coursera/Stanford)", topic="Machine Learning", type="Video",
         difficulty="Intermediate", tags="machine learning regression classification supervised learning",
         description="The classic, most-enrolled introduction to machine learning, covering the core algorithms from the ground up.",
         url="https://www.coursera.org/learn/machine-learning", source="Coursera / Stanford", rating=4.9),
    dict(id="R11", title="Kaggle: Intro to Machine Learning", topic="Machine Learning", type="Tutorial",
         difficulty="Beginner", tags="machine learning intro decision trees validation",
         description="A hands-on first course in machine learning: model building, validation, and decision trees.",
         url="https://www.kaggle.com/learn/intro-to-machine-learning", source="Kaggle", rating=4.6),
    dict(id="R12", title="scikit-learn Tutorials", topic="Machine Learning", type="Article",
         difficulty="Intermediate", tags="scikit-learn python ml algorithms tutorial",
         description="Official scikit-learn tutorials covering the estimator API and core ML workflows in Python.",
         url="https://scikit-learn.org/stable/tutorial/index.html", source="scikit-learn", rating=4.6),
    dict(id="R13", title="Kaggle Competitions", topic="Machine Learning", type="Project",
         difficulty="Intermediate", tags="machine learning competitions projects real datasets",
         description="Real-world machine learning competitions to practice building and validating models on live data.",
         url="https://www.kaggle.com/competitions", source="Kaggle", rating=4.5),

    dict(id="R14", title="PyTorch Official Tutorials", topic="Deep Learning", type="Tutorial",
         difficulty="Intermediate", tags="deep learning pytorch neural networks tensors",
         description="Official PyTorch tutorials from tensors and autograd through building and training neural nets.",
         url="https://pytorch.org/tutorials/", source="PyTorch", rating=4.7),
    dict(id="R15", title="TensorFlow Tutorials", topic="Deep Learning", type="Article",
         difficulty="Intermediate", tags="deep learning tensorflow keras neural networks",
         description="Official TensorFlow guides and tutorials for building neural networks with Keras.",
         url="https://www.tensorflow.org/tutorials", source="TensorFlow", rating=4.5),
    dict(id="R16", title="Deep Learning Specialization", topic="Deep Learning", type="Video",
         difficulty="Advanced", tags="deep learning neural networks cnn rnn specialization",
         description="A five-course specialization covering neural networks, CNNs, RNNs, and how to structure ML projects.",
         url="https://www.deeplearning.ai/courses/deep-learning-specialization/", source="DeepLearning.AI", rating=4.8),

    dict(id="R17", title="Hugging Face NLP Course", topic="NLP", type="Tutorial",
         difficulty="Advanced", tags="nlp transformers bert huggingface tokenization",
         description="A free course on using transformer models for NLP tasks with the Hugging Face ecosystem.",
         url="https://huggingface.co/learn/nlp-course", source="Hugging Face", rating=4.8),
    dict(id="R18", title="Hugging Face Transformers Docs", topic="NLP", type="Article",
         difficulty="Advanced", tags="nlp transformers documentation models",
         description="Reference documentation for the Transformers library, covering models, pipelines, and fine-tuning.",
         url="https://huggingface.co/docs/transformers/index", source="Hugging Face", rating=4.6),

    dict(id="R19", title="Kaggle: Pandas", topic="Data Science", type="Tutorial",
         difficulty="Beginner", tags="pandas data manipulation dataframes python",
         description="Short interactive lessons on data manipulation with pandas DataFrames.",
         url="https://www.kaggle.com/learn/pandas", source="Kaggle", rating=4.6),
    dict(id="R20", title="Kaggle: Data Visualization", topic="Data Science", type="Tutorial",
         difficulty="Beginner", tags="data visualization matplotlib seaborn charts",
         description="Hands-on lessons on building clear, informative charts from data.",
         url="https://www.kaggle.com/learn/data-visualization", source="Kaggle", rating=4.5),
    dict(id="R21", title="Pandas: Getting Started", topic="Data Science", type="Article",
         difficulty="Beginner", tags="pandas documentation official getting started",
         description="The official pandas getting-started guide for data manipulation in Python.",
         url="https://pandas.pydata.org/docs/getting_started/index.html", source="pandas.pydata.org", rating=4.5),
    dict(id="R22", title="Kaggle Datasets", topic="Data Science", type="Project",
         difficulty="Intermediate", tags="data science eda datasets projects",
         description="Thousands of real public datasets to practice exploratory data analysis and build a portfolio.",
         url="https://www.kaggle.com/datasets", source="Kaggle", rating=4.4),

    dict(id="R23", title="SQLBolt — Learn SQL", topic="SQL", type="Tutorial",
         difficulty="Beginner", tags="sql queries interactive database basics",
         description="Interactive, in-browser SQL lessons that let you write and run real queries as you learn.",
         url="https://sqlbolt.com/", source="SQLBolt", rating=4.7),
    dict(id="R24", title="W3Schools SQL Tutorial", topic="SQL", type="Article",
         difficulty="Beginner", tags="sql tutorial queries joins database basics",
         description="A reference-style walkthrough of SQL syntax, joins, and common queries.",
         url="https://www.w3schools.com/sql/", source="W3Schools", rating=4.3),
    dict(id="R25", title="Khan Academy: Intro to SQL", topic="SQL", type="Video",
         difficulty="Beginner", tags="sql database khan academy intro",
         description="A video-led introduction to querying and managing data with SQL.",
         url="https://www.khanacademy.org/computing/computer-programming/sql", source="Khan Academy", rating=4.5),

    dict(id="R26", title="CS50: Introduction to Computer Science", topic="Computer Science", type="Video",
         difficulty="Beginner", tags="computer science fundamentals harvard programming algorithms",
         description="Harvard's renowned introduction to computer science and programming, covering algorithms and data structures.",
         url="https://cs50.harvard.edu/x/", source="Harvard (CS50)", rating=4.9),
]

DEMO_STUDENTS = [
    dict(name="Aditi", skill_level="Beginner", preferred_type="Video",
         interest="I want to learn python basics and programming fundamentals from scratch."),
    dict(name="Rahul", skill_level="Intermediate", preferred_type="Tutorial",
         interest="I want to get into machine learning and understand core algorithms."),
    dict(name="Meera", skill_level="Advanced", preferred_type="Tutorial",
         interest="I'm interested in deep learning, transformers, and nlp."),
    dict(name="Arjun", skill_level="Beginner", preferred_type="Tutorial",
         interest="I want to learn sql and how relational databases work."),
    dict(name="Sara", skill_level="Intermediate", preferred_type="Project",
         interest="I want hands-on practice with data science analysis and visualization in python."),
    dict(name="Karan", skill_level="Beginner", preferred_type="Tutorial",
         interest="I want to build websites using html css and javascript web development."),
    dict(name="Divya", skill_level="Intermediate", preferred_type="Tutorial",
         interest="I want to build backend rest apis with python fastapi web development."),
    dict(name="Nikhil", skill_level="Advanced", preferred_type="Video",
         interest="I want to master deep learning and neural network architectures."),
    dict(name="Priya", skill_level="Intermediate", preferred_type="Tutorial",
         interest="I'm learning react and modern frontend web development."),
    dict(name="Farhan", skill_level="Beginner", preferred_type="Project",
         interest="I want beginner-friendly python projects to practice coding."),
    dict(name="Ishita", skill_level="Advanced", preferred_type="Article",
         interest="I want to go deep into nlp and huggingface transformers."),
    dict(name="Vikram", skill_level="Intermediate", preferred_type="Project",
         interest="I want real datasets to practice machine learning competitions."),
]


def seed_if_empty():
    session = get_session()

    if session.query(Resource).count() == 0:
        for r in RESOURCES:
            session.add(Resource(**r))
        session.commit()

    if session.query(Student).count() == 0:
        random.seed(42)
        students = []
        for s in DEMO_STUDENTS:
            student = Student(id=new_id(), **s)
            session.add(student)
            students.append(student)
        session.commit()

        resources = session.query(Resource).all()
        interaction_types = ["Viewed", "Clicked", "Liked", "Completed"]

        for student in students:
            interest_lower = student.interest.lower()
            relevant = [
                r for r in resources
                if r.topic.lower() in interest_lower
                or any(tag in interest_lower for tag in r.tags.split())
            ]
            relevant_ids = {r.id for r in relevant}

            n_interactions = random.randint(4, 9)
            chosen = random.sample(resources, k=min(n_interactions, len(resources)))
            for r in chosen:
                is_relevant = r.id in relevant_ids
                itype = random.choices(
                    interaction_types,
                    weights=[1, 2, 3, 3] if is_relevant else [4, 2, 1, 1],
                )[0]
                rating = random.choice([4, 5]) if is_relevant else random.choice([2, 3])
                session.add(Interaction(
                    student_id=student.id,
                    resource_id=r.id,
                    interaction_type=itype,
                    rating=rating if random.random() < 0.6 else None,
                ))
        session.commit()

    session.close()
