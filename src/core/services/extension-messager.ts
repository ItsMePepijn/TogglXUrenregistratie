import { MessageBase } from '../models/message-base.model';

export class ExtensionMessenger {
  public static async sendMessageToContent<TReq extends MessageBase, TResp>(
    message: TReq,
  ): Promise<TResp | null> {
    try {
      const activeTabId = await this.getActiveTabId();
      if (activeTabId === null) {
        console.warn('No active tab found to send message.');
        return null;
      }

      const response = await chrome.tabs.sendMessage(activeTabId, message);
      return response as TResp;
    } catch (error) {
      console.error('Error sending message to content script:', error);
      return null;
    }
  }

  public static async sendMessageToRuntime<TReq extends MessageBase>(
    message: TReq,
  ): Promise<void> {
    try {
      await chrome.runtime.sendMessage(message);
    } catch (error) {
      console.error('Error sending message to runtime:', error);
    }
  }

  public static startListeningToMsg<T extends MessageBase>(
    messageType: string,
    callback: (
      message: T,
      sendResponse: (response?: any) => void,
    ) => Promise<void> | void,
  ): void {
    chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
      if (message?.type === messageType) {
        await callback(message as T, sendResponse);
      }

      return true;
    });
  }

  private static async getActiveTabId(): Promise<number | null> {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs.length === 0) {
      return null;
    }

    const { id } = tabs[0];
    return id ?? null;
  }
}
