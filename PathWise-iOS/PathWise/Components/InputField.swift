import SwiftUI

struct InputField: View {
    let label: String
    let icon: String
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var errorMessage: String? = nil

    @State private var showPassword = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if !label.isEmpty {
                Text(label)
                    .capsStyle(size: 11, color: AppColors.darkText)
            }
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundStyle(AppColors.grayText)
                    .frame(width: 20)
                if isSecure && !showPassword {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }
                if isSecure {
                    Button { showPassword.toggle() } label: {
                        Image(systemName: showPassword ? "eye.slash" : "eye")
                            .foregroundStyle(AppColors.grayText)
                    }
                }
            }
            .font(AppTypography.body)
            .padding(.horizontal, 16)
            .frame(height: AppTheme.inputHeight)
            .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))

            if let errorMessage {
                Text(errorMessage)
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.errorRed)
            }
        }
    }
}
