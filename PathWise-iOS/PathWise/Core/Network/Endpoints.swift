import Foundation

enum Endpoint {
    // Auth
    case signup, signin, me, updateProfile, changePassword
    // Assessment
    case getAssessment(userId: String), submitAssessment, getCertificateRecs, getCareerRecommendations, getSkillGapAnalysis
    // Roadmap
    case getRoadmap(userId: String), generateRoadmap, completeMilestone(milestoneId: String)
    // Tasks
    case listTasks(userId: String), createTask, updateTask(taskId: String), generateMilestoneTasks, generateCustomTasks
    // Progress
    case getProgress(userId: String)
    // Streaks
    case getStreak(userId: String), recordActivity
    // Achievements
    case getAchievements(userId: String), awardAchievement
    // Notifications
    case getNotifications(userId: String), markNotificationsRead
    // Certificates
    case getCertificates(userId: String), addCertificate

    var path: String {
        switch self {
        case .signup: return "/auth/signup"
        case .signin: return "/auth/signin"
        case .me, .updateProfile: return "/auth/me"
        case .changePassword: return "/auth/change-password"
        case .getAssessment(let userId): return "/assessment/\(userId)"
        case .submitAssessment: return "/assessment"
        case .getCertificateRecs: return "/assessment/certificates"
        case .getCareerRecommendations: return "/assessment/career-recommendations"
        case .getSkillGapAnalysis: return "/assessment/skill-gap-analysis"
        case .getRoadmap(let userId): return "/roadmap/\(userId)"
        case .generateRoadmap: return "/roadmap"
        case .completeMilestone(let id): return "/roadmap/milestones/\(id)/complete"
        case .listTasks(let userId): return "/tasks?userId=\(userId)"
        case .createTask: return "/tasks"
        case .updateTask(let taskId): return "/tasks/\(taskId)"
        case .generateMilestoneTasks: return "/tasks/generate/milestone"
        case .generateCustomTasks: return "/tasks/generate/custom"
        case .getProgress(let userId): return "/progress/\(userId)"
        case .getStreak(let userId): return "/streaks/\(userId)"
        case .recordActivity: return "/streaks/record"
        case .getAchievements(let userId): return "/streaks/achievements/\(userId)"
        case .awardAchievement: return "/streaks/achievements/award"
        case .getNotifications(let userId): return "/streaks/notifications/\(userId)"
        case .markNotificationsRead: return "/streaks/notifications/read"
        case .getCertificates(let userId): return "/streaks/certificates/\(userId)"
        case .addCertificate: return "/streaks/certificates"
        }
    }

    var method: String {
        switch self {
        case .me, .getAssessment, .getRoadmap, .listTasks, .getProgress,
             .getStreak, .getAchievements, .getNotifications, .getCertificates:
            return "GET"
        case .updateProfile, .updateTask:
            return "PATCH"
        default:
            return "POST"
        }
    }
}
