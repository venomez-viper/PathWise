import Foundation

enum APIError: LocalizedError {
    case unauthenticated
    case notFound
    case invalidArgument(String)
    case alreadyExists(String)
    case permissionDenied
    case serverError(Int, String)
    case networkError(Error)
    case decodingError(Error)

    var errorDescription: String? {
        switch self {
        case .unauthenticated: return "Your session has expired. Please sign in again."
        case .notFound: return "The requested resource was not found."
        case .invalidArgument(let msg): return msg
        case .alreadyExists(let msg): return msg
        case .permissionDenied: return "You don't have permission to do this."
        case .serverError(_, let msg): return msg.isEmpty ? "Something went wrong. Please try again." : msg
        case .networkError: return "No internet connection. Please check your network."
        case .decodingError: return "Something went wrong reading the server response."
        }
    }
}
