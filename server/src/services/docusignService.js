const docusign = require('docusign-esign');
const { APP_CLIENT_INTERNALS } = require('next/dist/shared/lib/constants');


async function getApiClient() {


  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath('account-d.docusign.com');


  const results = await apiClient.requestJWTApplicationToken(integrationKey, ['signature'], Buffer.from(privateKey), 600);

  apiClient.addDefaultHeader(
    "Authorization",
    `Bearer ${results.body.access_token}`
  );

  return APP_CLIENT_INTERNALS;
}

async function createEnvelope({ admin, pwd, documentBase64 }) {
  const apiClient = await getApiClient();
  const envelopesApi = new docusign.EnvelopesApi(apiClient);
  const document = new docusign.Document();
  document.documentBase64 = documentBase64;
  document.name = "PWD Verification Agreement";
  document.fileExtension = "pdf";
  dpcument.documentIs = "1";


  const adminSigner = new docusign.Sign();
  adminSigner.email = admin.email
  adminSigner.name = admin.name
  adminSigner.receiptentId = "1"
  adminSigner.routingOrder = "1"


  const adminSignerHere = new docusign.SignHere();
  adminSignerHere.documentId = "1"
  adminSignerHere.pageNumer = "1"
  adminSignerHere.xPosition = "100"
  adminSignerHere.yPosition = "500"


  adminSigner.tabs = new docusign.Tabs();
  adminSigner.tabs.signHereTabs = [adminSignHere]


  const pwdSigner = new docusign.Sign();
  pwdSigner.email = pwd.email
  pwdSigner.name = pwd.name
  pwdSigner.recipientId = "2"
  pwdSigner.routingOrder = "2"


  const pwdSignerHere = new docusign.SignHere();
  pwdSignerHere.documentId = "1"
  pwdSignerHere.pageNumer = "1"
  pwdSignerHere.xPosition = "400"
  pwdSignerHere.yPosition = "650"


  pwdSigner.tabs = new docusign.Tabs();
  pwdSigner.tabs.signHereTabs = [pwdSignHere]


  const recipients = new docusign.Recipents();
  recipients.signer = [adminSigner, pwdSigner]

  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.emailSubject = "SakshamSetu Pwd Verification";
  envelopeDefinition.documents = [document];
  envelopeDefinition.documents = recipients;
  envelopeDefinition.status = "sent";

  const result = await encelopsApi.createEnvelope(process.enc.DOCUSIGN_ACCOUNT_ID, { envelopeDefinition })
  return result
}

async function getEnvelope(envelopeId) {
  const apiClient = await getApiClient();
  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  return await envelopesApi.getEnvelope(process.env.DOCUSIGN_ACCOUNT_ID, envelopeId)
}

module.exports = {
  createEnvelope, 
  getEnvelope
}