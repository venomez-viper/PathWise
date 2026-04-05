import XCTest
@testable import PathWise

final class DashboardViewModelTests: XCTestCase {
    func testInitialState() {
        let vm = DashboardViewModel(api: APIClient(), userId: "test")
        XCTAssertFalse(vm.hasAssessment)
        XCTAssertTrue(vm.careerMatches.isEmpty)
        XCTAssertNil(vm.progressStats)
        XCTAssertNil(vm.roadmap)
        XCTAssertFalse(vm.isLoading)
    }
}
