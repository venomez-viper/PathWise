import Foundation
import Observation

@Observable
class DashboardViewModel {
    let api: APIClient
    let userId: String

    var assessment: AssessmentResult?
    var progressStats: ProgressStats?
    var roadmap: Roadmap?
    var isLoading = false
    var error: String?

    var hasAssessment: Bool { assessment != nil }
    var careerMatches: [CareerMatch] { assessment?.careerMatches ?? [] }

    init(api: APIClient, userId: String) {
        self.api = api
        self.userId = userId
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }

        async let assessmentReq: AssessmentResponse = api.request(.getAssessment(userId: userId))
        async let progressReq: ProgressResponse = api.request(.getProgress(userId: userId))
        async let roadmapReq: RoadmapResponse = api.request(.getRoadmap(userId: userId))

        do {
            let (a, p, r) = try await (assessmentReq, progressReq, roadmapReq)
            assessment = a.result
            progressStats = p.stats
            roadmap = r.roadmap
        } catch {
            // Load what we can — assessment might not exist yet
            do { assessment = (try await api.request(.getAssessment(userId: userId)) as AssessmentResponse).result } catch {}
            do { progressStats = (try await api.request(.getProgress(userId: userId)) as ProgressResponse).stats } catch {}
            do { roadmap = (try await api.request(.getRoadmap(userId: userId)) as RoadmapResponse).roadmap } catch {}
        }
    }
}
