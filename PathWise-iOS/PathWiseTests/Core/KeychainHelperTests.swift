import XCTest
@testable import PathWise

final class KeychainHelperTests: XCTestCase {
    override func tearDown() {
        KeychainHelper.deleteToken()
    }

    func testSaveAndRetrieveToken() {
        KeychainHelper.saveToken("test-jwt-token-123")
        XCTAssertEqual(KeychainHelper.getToken(), "test-jwt-token-123")
    }

    func testDeleteToken() {
        KeychainHelper.saveToken("to-delete")
        KeychainHelper.deleteToken()
        XCTAssertNil(KeychainHelper.getToken())
    }

    func testOverwriteToken() {
        KeychainHelper.saveToken("old-token")
        KeychainHelper.saveToken("new-token")
        XCTAssertEqual(KeychainHelper.getToken(), "new-token")
    }

    func testGetTokenWhenNoneExists() {
        KeychainHelper.deleteToken()
        XCTAssertNil(KeychainHelper.getToken())
    }
}
