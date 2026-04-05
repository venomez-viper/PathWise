import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

enum AppColors {
    static let primaryPurple = Color(hex: "7C3AED")
    static let darkPurple = Color(hex: "5B21B6")
    static let splashPurple = Color(hex: "7E22CE")
    static let splashPurpleDark = Color(hex: "6B21A8")
    static let tealAccent = Color(hex: "14B8A6")
    static let tealLight = Color(hex: "2DD4BF")
    static let offWhiteBg = Color(hex: "F8F7FC")
    static let lavenderBg = Color(hex: "F5F3FF")
    static let lightPurpleTint = Color(hex: "EDE9FE")
    static let inputBg = Color(hex: "F3F4F6")
    static let darkText = Color(hex: "1F2937")
    static let grayText = Color(hex: "6B7280")
    static let lightGrayBorder = Color(hex: "E5E7EB")
    static let successGreen = Color(hex: "059669")
    static let successGreenLight = Color(hex: "10B981")
    static let errorRed = Color(hex: "EF4444")
    static let highPriorityRed = Color(hex: "DC2626")
    static let warningAmber = Color(hex: "F59E0B")
    static let amberGold = Color(hex: "D4A017")
    static let lowPriorityTeal = Color(hex: "5EEAD4")
    static let mentorTipBg = Color(hex: "FDF6E3")
    static let purpleGradient = LinearGradient(colors: [darkPurple, primaryPurple], startPoint: .leading, endPoint: .trailing)
    static let tealPurpleGradient = LinearGradient(colors: [tealAccent, primaryPurple], startPoint: .leading, endPoint: .trailing)
    static let splashGradient = LinearGradient(colors: [Color(hex: "7E22CE"), Color(hex: "6B21A8")], startPoint: .top, endPoint: .bottom)
    static let progressGradient = LinearGradient(colors: [tealAccent, primaryPurple], startPoint: .leading, endPoint: .trailing)
}
