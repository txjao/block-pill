import { registerActivity } from './activity/register-activity';
import { registerAntiMode } from './anti-mode/register-anti-mode';
import { createChromeBrowserContext } from './context';
import { registerChromeMessageRouter } from './message-router';
import { registerPermanentBlock } from './permanent-block/register-permanent-block';
import { registerStandardBlock } from './standard-block/register-standard-block';

export function registerChromeBrowserRuntime(): void {
  const context = createChromeBrowserContext();

  registerChromeMessageRouter({
    activity: registerActivity(context),
    antiMode: registerAntiMode(context),
    permanentBlock: registerPermanentBlock(context),
    standardBlock: registerStandardBlock(context),
  });
}
