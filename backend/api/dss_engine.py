# api/dss_engine.py

def analyze_performance(student_profile, module_name, score):
    """
    Analyzes student score and decides the next learning path.
    Returns a dictionary with the decision and message.
    """
    decision = {}

    # --- RULE BASE (The "Brain" of the DSS) ---
    
    # Rule 1: High Performance (Score > 80)
    if score >= 80:
        decision['status'] = 'advanced'
        decision['unlock_next'] = True
        decision['message'] = (
            f"Excellent work on {module_name}! You've unlocked the next module "
            "and gained access to advanced bonus material."
        )
        # Logic to update student profile level could happen here or in the view
        new_level = student_profile.current_module_level + 1
        
    # Rule 2: Moderate Performance (60 <= Score < 80)
    elif 60 <= score < 80:
        decision['status'] = 'standard'
        decision['unlock_next'] = True
        decision['message'] = (
            f"Good job. You passed {module_name}. We recommend reviewing "
            "the summary notes before moving forward."
        )
        new_level = student_profile.current_module_level + 1

    # Rule 3: Low Performance (Score < 60)
    else:
        decision['status'] = 'remedial'
        decision['unlock_next'] = False
        decision['message'] = (
            f"You scored {score}% on {module_name}. To ensure you master this topic, "
            "please review the lecture video and retake the quiz."
        )
        new_level = student_profile.current_module_level # Level stays the same

    return decision, new_level