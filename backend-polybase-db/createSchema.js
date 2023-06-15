const Polybase = require("@polybase/client");
const { ethPersonalSign } = require("@polybase/eth");
const { KeysSchema } = require("./schemas/KeysSchema.js");

require("dotenv").config();

const schemaDetails = {
  namespace: "TestTokens",
  collectionName: "Keys",
};

const sendSchematoPolybase = async (namespace) =>
  await db.applySchema(
    `
  ${KeysSchema(schemaDetails.collectionName)}
`,
    namespace
  );

const createSchema = async ({ namespace, collectionName }) => {
  const db = new Polybase({ defaultNamespace: namespace });

  db.signer((data) => {
    return {
      h: "eth-personal-sign",
      sig: ethPersonalSign(process.env.PRIVATE_KEY, data),
    };
  });

  const newSchema = await sendSchematoPolybase(namespace);
  console.log(newSchema);
};

createSchema(schemaDetails);
