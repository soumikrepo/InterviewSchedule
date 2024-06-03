using {interviewSchedule.db as db} from '../db/schema';

service serviceCatalog @(path: '/serviceCatalog') {
    @readonly
    entity JobApplication as projection on db.jobApplication;

    @readonly
    entity Position as projection on db.Position;

    @readonly
    entity JobRequisition as projection on db.JobRequisition;

    @readonly
    entity jobApplicationInterview as projection on db.jobApplicationInterview;

    @readonly
    entity User as projection on db.User;
}