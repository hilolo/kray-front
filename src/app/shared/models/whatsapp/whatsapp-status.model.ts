/**
 * WhatsApp status response model
 */
export interface WhatsAppStatus {
  instance: {
    instanceName: string;
    state: 'open' | 'close';
  };
}

/**
 * WhatsApp connect response model
 */
export interface WhatsAppConnect {
  pairingCode: string | null;
  code: string;
  base64: string;
  count: number;
}

/**
 * WhatsApp number check result
 */
export interface WhatsAppNumberCheck {
  jid: string;
  exists: boolean;
  number: string;
}

/**
 * WhatsApp numbers response
 * ApiService returns response.data, so this is the actual structure received
 */
export interface WhatsAppNumbersResponse {
  content: WhatsAppNumberCheck[];
}

