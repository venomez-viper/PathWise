import Foundation

struct Certificate: Codable, Identifiable {
    let id: String
    let userId: String
    let name: String
    let issuer: String
    let issuedDate: String?
    let verified: Bool
    let url: String?
    let createdAt: String
}

struct CertificatesResponse: Codable {
    let certificates: [Certificate]
}

struct AddCertificateRequest: Codable {
    let userId: String
    let name: String
    let issuer: String
    let issuedDate: String?
    let url: String?
}

struct CertificateResponse: Codable {
    let certificate: Certificate
}
