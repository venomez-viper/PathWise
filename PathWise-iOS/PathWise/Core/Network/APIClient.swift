import Foundation

@Observable
class APIClient {
    #if DEBUG
    var baseURL = URL(string: "http://localhost:4000")!
    #else
    var baseURL = URL(string: "https://staging-pathwise-4mxi.encr.app")!
    #endif

    var authToken: String?

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        return d
    }()

    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.keyEncodingStrategy = .convertToSnakeCase
        return e
    }()

    func request<T: Decodable>(_ endpoint: Endpoint, body: (any Encodable)? = nil) async throws -> T {
        let urlString = baseURL.absoluteString + endpoint.path
        var request = URLRequest(url: URL(string: urlString)!)
        request.httpMethod = endpoint.method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try encoder.encode(AnyEncodable(body))
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError(0, "Invalid response")
        }

        if !(200...299).contains(httpResponse.statusCode) {
            let errorBody = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
            let message = errorBody?["message"] as? String ?? errorBody?["code"] as? String ?? "Request failed"
            switch httpResponse.statusCode {
            case 401: throw APIError.unauthenticated
            case 404: throw APIError.notFound
            case 400: throw APIError.invalidArgument(message)
            case 409: throw APIError.alreadyExists(message)
            case 403: throw APIError.permissionDenied
            default: throw APIError.serverError(httpResponse.statusCode, message)
            }
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    func send(_ endpoint: Endpoint, body: (any Encodable)? = nil) async throws {
        let _: EmptyResponse = try await request(endpoint, body: body)
    }
}

private struct EmptyResponse: Decodable {}

struct AnyEncodable: Encodable {
    private let _encode: (Encoder) throws -> Void
    init(_ wrapped: any Encodable) { _encode = wrapped.encode }
    func encode(to encoder: Encoder) throws { try _encode(encoder) }
}
