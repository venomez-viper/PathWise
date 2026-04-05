import XCTest
@testable import PathWise

final class RoadmapViewModelTests: XCTestCase {

    // MARK: - Initial state

    func testInitialState() {
        let vm = RoadmapViewModel(api: APIClient(), userId: "user-1")
        XCTAssertNil(vm.roadmap)
        XCTAssertTrue(vm.tasks.isEmpty)
        XCTAssertNil(vm.assessment)
        XCTAssertFalse(vm.isLoading)
        XCTAssertNil(vm.error)
        XCTAssertFalse(vm.showAdjustTimeline)
    }

    // MARK: - Default timeline

    func testDefaultTimelineIsStandard() {
        let vm = RoadmapViewModel(api: APIClient(), userId: "user-1")
        XCTAssertEqual(vm.selectedTimeline, .standard)
    }

    // MARK: - completionFraction

    func testCompletionFractionIsZeroWhenNoRoadmap() {
        let vm = RoadmapViewModel(api: APIClient(), userId: "user-1")
        XCTAssertEqual(vm.completionFraction, 0.0)
    }

    func testCompletionFractionDerived() {
        let vm = RoadmapViewModel(api: APIClient(), userId: "user-1")
        vm.roadmap = Roadmap(id: "r1", userId: "user-1",
                             targetRole: "Data Analyst",
                             completionPercent: 40,
                             milestones: [])
        XCTAssertEqual(vm.completionFraction, 0.4, accuracy: 0.001)
    }

    // MARK: - Task grouping

    func testCoursesGroupedCorrectly() {
        let vm = RoadmapViewModel(api: APIClient(), userId: "user-1")
        vm.tasks = [
            makeTask(id: "t1", category: "course"),
            makeTask(id: "t2", category: "courses"),
            makeTask(id: "t3", category: "project"),
            makeTask(id: "t4", category: "networking")
        ]
        XCTAssertEqual(vm.courseTasks.count, 2)
        XCTAssertTrue(vm.courseTasks.map(\.id).contains("t1"))
        XCTAssertTrue(vm.courseTasks.map(\.id).contains("t2"))
    }

    func testProjectsGroupedCorrectly() {
        let vm = RoadmapViewModel(api: APIClient(), userId: "user-1")
        vm.tasks = [
            makeTask(id: "t1", category: "project"),
            makeTask(id: "t2", category: "projects"),
            makeTask(id: "t3", category: "course"),
            makeTask(id: "t4", category: "networking")
        ]
        XCTAssertEqual(vm.projectTasks.count, 2)
    }

    func testNetworkingGroupedCorrectly() {
        let vm = RoadmapViewModel(api: APIClient(), userId: "user-1")
        vm.tasks = [
            makeTask(id: "t1", category: "networking"),
            makeTask(id: "t2", category: "course"),
            makeTask(id: "t3", category: "project")
        ]
        XCTAssertEqual(vm.networkingTasks.count, 1)
        XCTAssertEqual(vm.networkingTasks.first?.id, "t1")
    }

    func testUnknownCategoryNotGrouped() {
        let vm = RoadmapViewModel(api: APIClient(), userId: "user-1")
        vm.tasks = [makeTask(id: "t1", category: "other")]
        XCTAssertTrue(vm.courseTasks.isEmpty)
        XCTAssertTrue(vm.projectTasks.isEmpty)
        XCTAssertTrue(vm.networkingTasks.isEmpty)
    }

    // MARK: - skillGaps

    func testSkillGapsEmptyWithNoAssessment() {
        let vm = RoadmapViewModel(api: APIClient(), userId: "user-1")
        XCTAssertTrue(vm.skillGaps.isEmpty)
    }

    // MARK: - Timeline options

    func testTimelineOptionProperties() {
        XCTAssertEqual(TimelineOption.accelerated.months, 3)
        XCTAssertEqual(TimelineOption.standard.months, 6)
        XCTAssertEqual(TimelineOption.relaxed.months, 9)
        XCTAssertEqual(TimelineOption.extended.months, 12)
    }

    func testOnlyStandardIsRecommended() {
        for option in TimelineOption.allCases {
            if option == .standard {
                XCTAssertTrue(option.isRecommended)
            } else {
                XCTAssertFalse(option.isRecommended)
            }
        }
    }

    func testApiValues() {
        XCTAssertEqual(TimelineOption.accelerated.apiValue, "3m")
        XCTAssertEqual(TimelineOption.standard.apiValue, "6m")
        XCTAssertEqual(TimelineOption.relaxed.apiValue, "9m")
        XCTAssertEqual(TimelineOption.extended.apiValue, "12m")
    }

    func testAllTimelineOptionsPresent() {
        XCTAssertEqual(TimelineOption.allCases.count, 4)
    }

    // MARK: - showAdjustTimeline

    func testShowAdjustTimelineToggle() {
        let vm = RoadmapViewModel(api: APIClient(), userId: "user-1")
        XCTAssertFalse(vm.showAdjustTimeline)
        vm.showAdjustTimeline = true
        XCTAssertTrue(vm.showAdjustTimeline)
    }

    // MARK: - Helpers

    private func makeTask(id: String, category: String) -> TaskItem {
        TaskItem(
            id: id,
            userId: "user-1",
            milestoneId: nil,
            title: "Task \(id)",
            description: nil,
            status: "pending",
            priority: "medium",
            category: category,
            dueDate: nil,
            completedAt: nil,
            createdAt: "2026-01-01",
            aiGenerated: false
        )
    }
}
