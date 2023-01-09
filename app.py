import streamlit as st
import json
from Classifier import KNearestNeighbours
from operator import itemgetter
import pandas as pd
import streamlit.components.v1 as components
# py -m streamlit run app.py
# streamlit run app.py for mac os
# Load data and questions list from corresponding JSON files
with open(r"data.json", "r+", encoding="utf-8") as f:
    data = json.load(f)
with open(r"titles.json", "r+", encoding="utf-8") as f:
    question_titles = json.load(f)

with open('style.css') as f:
    st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

def knn(test_point, k):
    # Create dummy target variable for the KNN Classifier
    target = [0 for item in question_titles]
    # Instantiate object for the Classifier
    model = KNearestNeighbours(data, target, test_point, k=k)
    # Run the algorithm
    model.fit()
    # Distances to most distant question
    max_dist = sorted(model.distances, key=itemgetter(0))[-1]
    # Print list of 10 recommendations < Change value of k for a different number >
    table = list()
    for i in model.indices:
        # Returns back question title and question link
        table.append([question_titles[i][0], question_titles[i][2]])
    return table


if __name__ == "__main__":
    topics = [
        "Array",
        "Backtracking",
        "Biconnected Component",
        "Binary Indexed Tree",
        "Binary Search",
        "Binary Search Tree",
        "Binary Tree",
        "Bit Manipulation",
        "Bitmask",
        "Brainteaser",
        "Breadth-First Search",
        "Bucket Sort",
        "Combinatorics",
        "Concurrency",
        "Counting",
        "Counting Sort",
        "Data Stream",
        "Database",
        "Depth-First Search",
        "Design",
        "Divide and Conquer",
        "Doubly-Linked List",
        "Dynamic Programming",
        "Enumeration",
        "Eulerian Circuit",
        "Game Theory",
        "Geometry",
        "Graph",
        "Greedy",
        "Hash Function",
        "Hash Table",
        "Heap (Priority Queue)",
        "Interactive",
        "Iterator",
        "Line Sweep",
        "Linked List",
        "Math",
        "Matrix",
        "Memoization",
        "Merge Sort",
        "Minimum Spanning Tree",
        "Monotonic Queue",
        "Monotonic Stack",
        "Number Theory",
        "Ordered Set",
        "Prefix Sum",
        "Probability and Statistics",
        "Queue",
        "Quickselect",
        "Radix Sort",
        "Randomized",
        "Recursion",
        "Rejection Sampling",
        "Reservoir Sampling",
        "Rolling Hash",
        "Segment Tree",
        "Shell",
        "Shortest Path",
        "Simulation",
        "Sliding Window",
        "Sorting",
        "Stack",
        "String",
        "String Matching",
        "Strongly Connected Component",
        "Suffix Array",
        "Topological Sort",
        "Tree",
        "Trie",
        "Two Pointers",
        "Union Find",
    ]

    questions = [title[0] for title in question_titles]
    st.header("DSA Question Recommendation System")
    apps = ["--Select--", "question based", "topic based"]
    app_options = st.selectbox("Select application:", apps)

    if app_options == "question based":
        question_select = st.selectbox("Select question:", ["--Select--"] + questions)
        if question_select == "--Select--":
            st.write("Select a question")
        else:
            n = st.number_input(
                "Number of questions:", min_value=5, max_value=20, step=1
            )
            # exact question needs to be given.
            topics = data[questions.index(question_select)]
            test_point = topics
            table = knn(test_point, n)
            for question, link in table:
                # Displays question title with link to question
                st.markdown(f"[{question}]({link})")
    elif app_options == apps[2]:
        options = st.multiselect("Select topics:", topics)
        if options:
            original_title = '<p style="font-family:Courier; color:Blue;">Select 40% to 60% acceptance rate for the best results!</p>'
            st.markdown(original_title, unsafe_allow_html=True)
            question_acceptance = st.slider("Question Acceptance Rate:", 10, 100, 80)
            n = st.number_input(
                "Number of questions:", min_value=5, max_value=20, step=1
            )
            # We are creating the test point of all the topics mentioned here in th form of 0 and 1 we have
            # and appending the question acceptance rate in the end.
            # We have question and title to show in the table for whatever recommendations that will
            # come after applying KNN
            test_point = [1 if topic in options else 0 for topic in topics]
            test_point.append(question_acceptance)
            table = knn(test_point, n)
            for question, link in table:
                # Displays question title with link to question
                st.markdown(f"[{question}]({link})")

        else:
            st.write(
                "This is a simple DSA Questions Recommender application. "
                "You can select the topics and change the question accpetance rate."
            )

    else:
        st.write("Select option")