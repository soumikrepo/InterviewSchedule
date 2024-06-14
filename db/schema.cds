namespace interviewSchedule.db;

using {sf_api_service} from '../srv/external/sf-api-service';

entity Position                as
    projection on sf_api_service.Position {
        code,
        positionTitle,
    }

entity JobRequisition          as
    projection on sf_api_service.JobRequisition {
        jobReqId,
        statusSetId,
        jobProfile,
        status, //reqStatus_Interview, reqStatus_Open
        recruiter,
        jobApplications : Association to  JobApplication on jobApplications.applicationId = jobReqId,
        positionNumber,
        
    }

entity JobApplicationInterview as
    projection on sf_api_service.JobApplicationInterview {
        applicationId,
        applicationInterviewId,
        candSlotMapId,
        endDate,
        isTimeSet,
        notes,
        recruitEventStaffId,
        source,
        startDate,
        status,
    }

entity JobApplication          as
    projection on sf_api_service.JobApplication {
        jobAppGuid,
        applicationId,
        firstName,
        lastName,
        contactEmail,
        jobReqId,
        jobApplicationInterview : Association to many JobApplicationInterview on jobApplicationInterview.applicationId = applicationId
        // jobApplicationInterview : Association to many jobApplicationInterview on jobApplicationInterview.applicationId = $self.applicationId
    }

entity User                    as
    projection on sf_api_service.User {
        userId,
        defaultFullName,
        email,
    }
