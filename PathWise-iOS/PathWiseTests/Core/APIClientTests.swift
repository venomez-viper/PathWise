import XCTest
@testable import PathWise

final class APIClientTests: XCTestCase {
    func testEndpointPaths() {
        XCTAssertEqual(Endpoint.signup.path, "/auth/signup")
        XCTAssertEqual(Endpoint.signin.path, "/auth/signin")
        XCTAssertEqual(Endpoint.me.path, "/auth/me")
        XCTAssertEqual(Endpoint.getAssessment(userId: "abc").path, "/assessment/abc")
        XCTAssertEqual(Endpoint.getRoadmap(userId: "xyz").path, "/roadmap/xyz")
        XCTAssertEqual(Endpoint.listTasks(userId: "u1").path, "/tasks?userId=u1")
        XCTAssertEqual(Endpoint.updateTask(taskId: "t1").path, "/tasks/t1")
        XCTAssertEqual(Endpoint.getProgress(userId: "p1").path, "/progress/p1")
        XCTAssertEqual(Endpoint.completeMilestone(milestoneId: "m1").path, "/roadmap/milestones/m1/complete")
        XCTAssertEqual(Endpoint.getStreak(userId: "s1").path, "/streaks/s1")
        XCTAssertEqual(Endpoint.getAchievements(userId: "a1").path, "/streaks/achievements/a1")
        XCTAssertEqual(Endpoint.getNotifications(userId: "n1").path, "/streaks/notifications/n1")
        XCTAssertEqual(Endpoint.getCertificates(userId: "c1").path, "/streaks/certificates/c1")
    }

    func testEndpointMethods() {
        XCTAssertEqual(Endpoint.me.method, "GET")
        XCTAssertEqual(Endpoint.signup.method, "POST")
        XCTAssertEqual(Endpoint.signin.method, "POST")
        XCTAssertEqual(Endpoint.updateProfile.method, "PATCH")
        XCTAssertEqual(Endpoint.updateTask(taskId: "t1").method, "PATCH")
        XCTAssertEqual(Endpoint.getAssessment(userId: "a").method, "GET")
        XCTAssertEqual(Endpoint.submitAssessment.method, "POST")
        XCTAssertEqual(Endpoint.listTasks(userId: "u").method, "GET")
        XCTAssertEqual(Endpoint.createTask.method, "POST")
    }
}
