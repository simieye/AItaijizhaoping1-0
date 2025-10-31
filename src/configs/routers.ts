import CANDIDATE_LOGIN from '../pages/candidate-login.jsx';
import CANDIDATE_RESUME-UPLOAD from '../pages/candidate-resume-upload.jsx';
import CANDIDATE_AI-INTERVIEW from '../pages/candidate-ai-interview.jsx';
import CANDIDATE_DASHBOARD from '../pages/candidate-dashboard.jsx';
import CANDIDATE_COMMUNITY from '../pages/candidate-community.jsx';
import RECRUITER_LOGIN from '../pages/recruiter-login.jsx';
import RECRUITER_JOB-POST from '../pages/recruiter-job-post.jsx';
import RECRUITER_CANDIDATES from '../pages/recruiter-candidates.jsx';
import RECRUITER_COMMUNICATION from '../pages/recruiter-communication.jsx';
import RECRUITER_DASHBOARD from '../pages/recruiter-dashboard.jsx';
import ADMIN_DASHBOARD from '../pages/admin-dashboard.jsx';
export const routers = [{
  id: "candidate-login",
  component: CANDIDATE_LOGIN
}, {
  id: "candidate-resume-upload",
  component: CANDIDATE_RESUME-UPLOAD
}, {
  id: "candidate-ai-interview",
  component: CANDIDATE_AI-INTERVIEW
}, {
  id: "candidate-dashboard",
  component: CANDIDATE_DASHBOARD
}, {
  id: "candidate-community",
  component: CANDIDATE_COMMUNITY
}, {
  id: "recruiter-login",
  component: RECRUITER_LOGIN
}, {
  id: "recruiter-job-post",
  component: RECRUITER_JOB-POST
}, {
  id: "recruiter-candidates",
  component: RECRUITER_CANDIDATES
}, {
  id: "recruiter-communication",
  component: RECRUITER_COMMUNICATION
}, {
  id: "recruiter-dashboard",
  component: RECRUITER_DASHBOARD
}, {
  id: "admin-dashboard",
  component: ADMIN_DASHBOARD
}]