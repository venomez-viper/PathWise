import XCTest
@testable import PathWise

final class TasksViewModelTests: XCTestCase {
    func testInitialState() {
        let vm = TasksViewModel(api: APIClient(), userId: "test")
        XCTAssertTrue(vm.tasks.isEmpty)
        XCTAssertTrue(vm.filteredTasks.isEmpty)
        XCTAssertTrue(vm.completedTasks.isEmpty)
        XCTAssertFalse(vm.showCelebration)
        XCTAssertTrue(vm.isDailyView)
    }
}
