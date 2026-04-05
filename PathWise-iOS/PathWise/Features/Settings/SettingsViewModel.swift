import SwiftUI

@Observable
class SettingsViewModel {
    // MARK: - Preferences (persisted via AppStorage backing)
    var pushNotifications: Bool = true
    var dailyReminders: Bool = true
    var weeklyReports: Bool = false

    // MARK: - AppStorage keys
    private enum Keys {
        static let pushNotifications = "pref_pushNotifications"
        static let dailyReminders    = "pref_dailyReminders"
        static let weeklyReports     = "pref_weeklyReports"
    }

    // MARK: - Init — load from UserDefaults
    init() {
        let defaults = UserDefaults.standard
        if defaults.object(forKey: Keys.pushNotifications) != nil {
            pushNotifications = defaults.bool(forKey: Keys.pushNotifications)
        }
        if defaults.object(forKey: Keys.dailyReminders) != nil {
            dailyReminders = defaults.bool(forKey: Keys.dailyReminders)
        }
        if defaults.object(forKey: Keys.weeklyReports) != nil {
            weeklyReports = defaults.bool(forKey: Keys.weeklyReports)
        }
    }

    // MARK: - Persistence helpers
    func savePushNotifications(_ value: Bool) {
        pushNotifications = value
        UserDefaults.standard.set(value, forKey: Keys.pushNotifications)
    }

    func saveDailyReminders(_ value: Bool) {
        dailyReminders = value
        UserDefaults.standard.set(value, forKey: Keys.dailyReminders)
    }

    func saveWeeklyReports(_ value: Bool) {
        weeklyReports = value
        UserDefaults.standard.set(value, forKey: Keys.weeklyReports)
    }

    // MARK: - Logout
    func logout(authManager: AuthManager) {
        authManager.signOut()
    }
}
