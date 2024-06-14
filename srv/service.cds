using {interviewSchedule.db as db} from '../db/schema';

service serviceCatalog @(path: '/serviceCatalog') {
    entity JobApplication as projection on db.JobApplication;

    entity Position as projection on db.Position;

    
    entity JobRequisition as select from db.JobRequisition;

    entity JobApplicationInterview as projection on db.JobApplicationInterview;

    entity User as projection on db.User;
}