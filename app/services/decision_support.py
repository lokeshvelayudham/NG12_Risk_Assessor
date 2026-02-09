import json
from langchain_google_vertexai import VertexAI
from langchain.prompts import PromptTemplate
from app.services.rag_engine import rag_engine
from app.services.patient_service import patient_service

from app.core.config import settings

class DecisionSupportAgent:
    def __init__(self):
        self.llm = VertexAI(model_name="gemini-2.0-flash-001", temperature=0.2, project=settings.GOOGLE_PROJECT_ID)

    def assess_patient(self, patient_id: str):
        patient = patient_service.get_patient(patient_id)
        if not patient:
            return {"error": "Patient not found"}

        # convert patient dict to string for query
        patient_str = json.dumps(patient)
        
        # 1. Retrieve relevant guidelines
        query = f"symptoms: {', '.join(patient['symptoms'])} age: {patient['age']} gender: {patient['gender']}"
        retrieved_docs = rag_engine.retrieve(query)
        context = "\n\n".join([doc['content'] for doc in retrieved_docs])

        # 2. Construct Prompt
        prompt_template = PromptTemplate.from_template(
            """
            You are an expert Clinical Decision Support Agent based on NICE NG12 guidelines.
            
            Analyze the following patient data and determine if they need Urgent Referral or Urgent Investigation for cancer.
            Use ONLY the provided Guideline Context.
            
            Patient Data:
            {patient_data}
            
            Guideline Context:
            {context}
            
            your response must be valid JSON in the following format:
            {{
                "assessment": "Urgent Referral" | "Urgent Investigation" | "Routine Referal/Review",
                "reasoning": "Clear explanation citing the guidelines.",
                "citations": ["Specific sections/pages"]
            }}
            Do not include markdown formatting (```json ... ```) in the output, just the raw JSON string.
            """
        )
        
        prompt = prompt_template.format(patient_data=patient_str, context=context)
        
        # 3. Call LLM
        response = self.llm.invoke(prompt)
        
        # 4. Parse Response (Simple cleanup to ensure JSON)
        try:
            cleaned_response = response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:-3]
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse LLM response",
                "raw_response": response
            }

decision_support_agent = DecisionSupportAgent()
