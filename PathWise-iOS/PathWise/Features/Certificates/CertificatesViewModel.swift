import Foundation
import Observation

@MainActor
@Observable
class CertificatesViewModel {
    let api: APIClient
    let userId: String

    var certificates: [Certificate] = []
    var isLoading = false
    var isSaving = false
    var error: String?

    init(api: APIClient, userId: String) {
        self.api = api
        self.userId = userId
    }

    // MARK: - Load

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let response: CertificatesResponse = try await api.request(.getCertificates(userId: userId))
            certificates = response.certificates
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Add Certificate

    func addCertificate(name: String, issuer: String, issuedDate: String?, url: String?) async {
        guard !name.trimmingCharacters(in: .whitespaces).isEmpty,
              !issuer.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        isSaving = true
        defer { isSaving = false }
        do {
            let request = AddCertificateRequest(
                userId: userId,
                name: name,
                issuer: issuer,
                issuedDate: issuedDate?.isEmpty == true ? nil : issuedDate,
                url: url?.isEmpty == true ? nil : url
            )
            let response: CertificateResponse = try await api.request(.addCertificate, body: request)
            certificates.insert(response.certificate, at: 0)
        } catch {
            self.error = error.localizedDescription
        }
    }
}
