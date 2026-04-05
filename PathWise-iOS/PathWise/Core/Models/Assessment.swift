import Foundation

struct AssessmentResult: Codable {
    let userId: String
    let completedAt: String
    let strengths: [String]
    let values: [String]
    let personalityType: String
    let careerMatches: [CareerMatch]
    let skillGaps: [SkillGap]?
    let currentSkills: [String]?
}

struct CareerMatch: Codable, Identifiable {
    var id: String { title }
    let title: String
    let matchScore: Int
    let description: String
    let requiredSkills: [String]
    let pathwayTime: String?
}

struct SkillGap: Codable, Identifiable {
    var id: String { skill }
    let skill: String
    let importance: String
    let learningResource: String
}

struct AssessmentResponse: Codable {
    let result: AssessmentResult?
}

struct SubmitAssessmentRequest: Codable {
    let userId: String
    let workStyle: String
    let strengths: [String]
    let values: [String]
    let currentSkills: [String]
    let experienceLevel: String
    let interests: [String]
    let currentRole: String?
    let personalityType: String?
    let rawAnswers: [String: String]?
}

struct CertificateRecsRequest: Codable {
    let userId: String
    let skills: [String]
    let targetRole: String
}

struct CareerRecsRequest: Codable {
    let userId: String
    let skills: [String]
    let targetRole: String
    let currentSkills: [String]
}

struct SkillGapRequest: Codable {
    let targetRole: String
    let technicalSkills: [String]
    let softSkills: [String]
}

struct CertificateRecsResponse: Codable {
    let recommendations: [CertificateRec]
}

struct CertificateRec: Codable, Identifiable {
    var id: String { name }
    let name: String
    let provider: String
    let description: String
    let url: String?
}

struct CareerRecsResponse: Codable {
    let portfolio: [CareerRec]
    let networking: [CareerRec]
    let jobApplications: [CareerRec]
}

struct CareerRec: Codable, Identifiable {
    var id: String { title }
    let title: String
    let description: String
}

struct SkillGapResponse: Codable {
    let result: SkillGapResult
}

struct SkillGapResult: Codable {
    let skillGaps: [SkillGap]
    let summary: String
    let topPriority: String
}
