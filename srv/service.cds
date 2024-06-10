using {interviewSchedule.db as db} from '../db/schema';

service serviceCatalog @(path: '/serviceCatalog') {
    entity JobApplication as projection on db.jobApplication;

    entity Position as projection on db.Position;

    entity JobRequisition as projection on db.JobRequisition;

    entity jobApplicationInterview as projection on db.jobApplicationInterview;

    entity User as projection on db.User;
}