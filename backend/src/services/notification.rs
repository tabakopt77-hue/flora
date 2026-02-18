
use crate::app_state::AppState;
use serde::Serialize;

#[derive(Serialize)]
struct TelegramMsg {
    chat_id: String,
    text: String,
    parse_mode: String,
}

pub struct NotificationService;

impl NotificationService {
    pub async fn send_order_alert(state: &AppState, order_id: uuid::Uuid, total: rust_decimal::Decimal, items_count: usize) {
        let bot_token = &state.config.telegram_bot_token;
        // In a real app, this ID comes from the Seller's profile settings. 
        // For demo, we use a default channel or the admin's ID.
        let target_chat_id = "-1001234567890"; // Example Channel ID or User ID

        if bot_token.is_empty() || bot_token == "your_bot_token" {
            tracing::warn!("Telegram Bot Token not set. Skipping notification.");
            return;
        }

        let msg_text = format!(
            "🌸 *Новый заказ!* 🌸\n\n🆔 *#{:?}*\n💰 Сумма: *{} ₽*\n📦 Товаров: *{}*\n\n_Проверьте админ-панель для деталей._",
            order_id, total, items_count
        );

        let payload = TelegramMsg {
            chat_id: target_chat_id.to_string(),
            text: msg_text,
            parse_mode: "Markdown".to_string(),
        };

        let client = reqwest::Client::new();
        let _ = client.post(format!("https://api.telegram.org/bot{}/sendMessage", bot_token))
            .json(&payload)
            .send()
            .await
            .map_err(|e| tracing::error!("Failed to send TG notification: {}", e));
    }
}
