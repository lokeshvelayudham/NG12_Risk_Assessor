import json
from typing import Dict, Optional
from app.core.config import settings

class PatientService:
    def __init__(self):
        self.data_path = settings.PATIENTS_DATA_PATH
        self._load_data()

    def _load_data(self):
        with open(self.data_path, 'r') as f:
            self.patients = json.load(f)
        self.patient_map = {p['patient_id']: p for p in self.patients}

    def get_patient(self, patient_id: str) -> Optional[Dict]:
        return self.patient_map.get(patient_id)

patient_service = PatientService()
