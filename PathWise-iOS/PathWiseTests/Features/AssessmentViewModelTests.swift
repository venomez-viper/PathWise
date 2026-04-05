import XCTest
@testable import PathWise

final class AssessmentViewModelTests: XCTestCase {
    func testInitialState() {
        let vm = AssessmentViewModel(api: APIClient(), userId: "test-user")
        XCTAssertEqual(vm.currentStep, 0)
        XCTAssertFalse(vm.canContinue)
        XCTAssertFalse(vm.isProcessing)
        XCTAssertNil(vm.result)
        XCTAssertEqual(vm.totalQuestions, 20)
    }

    func testSelectOptionEnablesContinue() {
        let vm = AssessmentViewModel(api: APIClient(), userId: "test-user")
        vm.selectOption(0)
        XCTAssertTrue(vm.canContinue)
    }

    func testNextAdvancesStep() {
        let vm = AssessmentViewModel(api: APIClient(), userId: "test-user")
        vm.selectOption(1)
        vm.next()
        XCTAssertEqual(vm.currentStep, 1)
    }

    func testPreviousGoesBack() {
        let vm = AssessmentViewModel(api: APIClient(), userId: "test-user")
        vm.selectOption(0)
        vm.next()
        vm.previous()
        XCTAssertEqual(vm.currentStep, 0)
    }

    func testPreviousAtZeroStaysAtZero() {
        let vm = AssessmentViewModel(api: APIClient(), userId: "test-user")
        vm.previous()
        XCTAssertEqual(vm.currentStep, 0)
    }
}
