import axios from 'axios';
import { config } from '../config';

interface SmsResponse {
  success: boolean;
  message: string;
}

interface ObitSmsResponse {
  success: boolean;
  code: number;
  message: string;
}

type NexahSmsErrorInactiveUser = {
  errorcode: '-10019';
  errordescription: 'Inactive User';
};

type NexahSmsErrorInvalidMobileNumber = {
  errorcode: '-10003';
  errordescription: 'Invalid Mobile Number';
};

type NexahSmsErrorClientSmsIdMaxLimitExceed = {
  errorcode: '-10026';
  errordescription: 'Client SMS ID Max Limit Exceed';
};

type NexahSmsErrorBalanceNotEnough = {
  errorcode: '-10008';
  errordescription: 'Balance not enough';
};

type NexahSmsError =
  | NexahSmsErrorInactiveUser
  | NexahSmsErrorInvalidMobileNumber
  | NexahSmsErrorClientSmsIdMaxLimitExceed
  | NexahSmsErrorBalanceNotEnough;

type NexahSmsResponseSuccess = {
  responsecode: 1;
  responsedescription: 'success';
  sms: {
    messageId: string;
    smsclientid: string;
    mobileno: string;
    status: 'success';
    errorcode: string;
    errordescription: string;
  }[];
};

type NexahSmsResponseError = {
  responsecode: 0;
  responsedescription: 'error';
  sms: (NexahSmsError & {
    messageId: string;
    smsclientid: string;
    mobileno: string;
    status: 'error';
  })[];
};

type NexahSmsResponse = (NexahSmsResponseSuccess | NexahSmsResponseError) & {
  responsemessage: string;
};

export async function sendSms(
  mobile: string,
  originalMessage: string
): Promise<SmsResponse> {
  if (config.modeTest) return { success: true, message: 'Test mode enabled' };

  if (mobile.startsWith('+')) mobile = mobile.split('+').pop();

  // return await obit(mobile, originalMessage);
  return await nexah('+' + mobile, originalMessage);
}

async function obit(
  mobile: string,
  originalMessage: string
): Promise<SmsResponse> {
  const keyApi = encodeURIComponent(config.smsKey);
  const sender = 'SURETECH';
  const destination = encodeURIComponent(mobile);
  const message = originalMessage + ' (SURETECH)';

  const urlBase = `https://obitsms.com/api/v2/bulksms?key_api=${keyApi}&sender=${sender}&destination=${destination}&message=${message}`;

  try {
    const response = await axios.get<ObitSmsResponse>(urlBase, {
      headers: { Accept: 'application/json' },
    });

    return response.data;
  } catch (error) {
    console.error('Error while sending Obit SMS:', error);
    throw error;
  }
}

async function nexah(
  mobile: string,
  originalMessage: string
): Promise<SmsResponse> {
  const user = config.nexah.user;
  const password = config.nexah.password;
  const sender = 'CFAFRICA';
  const destination = encodeURIComponent(mobile);
  const message = `${originalMessage} (${sender})`;

  const urlBase = `https://smsvas.com/bulk/public/index.php/api/v1/sendsms?user=${user}&password=${password}&senderid=${sender}&sms=${message}&mobiles=${destination}`;

  try {
    const response = await axios.get<NexahSmsResponse>(urlBase, {
      headers: { Accept: 'application/json' },
    });

    if (config.nexah.test) console.error(response);

    const { responsecode, responsedescription, responsemessage } =
      response.data;

    if (responsedescription === 'error') console.error(responsemessage);

    return { success: responsecode === 1, message: responsemessage };
  } catch (error) {
    console.error('Error while sending Nexah SMS:', error);
    throw error;
  }
}
