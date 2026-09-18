import { createPool } from "@vercel/postgres";

const participant = {
  name: "Faruque Abdullah",
  email: "abdullahruet13@gmail.com",
  phone: "01701011048",
  department: "BECM",
  university: "RUET",
  event: "mechamind",
  fee: 400,
};

const pool = createPool();
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("LOCK TABLE registrationData IN EXCLUSIVE MODE");

  const existing = await client.query(
    `SELECT single_data.registration_id
       FROM singleRegistrationData AS single_data
       JOIN registrationData AS master ON master.id = single_data.registration_id
      WHERE master.ispaid = TRUE
        AND LOWER(REGEXP_REPLACE(TRIM(single_data.email), '\\s+', '', 'g')) = $1
        AND $2 = ANY(single_data.events)
      ORDER BY single_data.registration_id DESC
      LIMIT 1`,
    [participant.email, participant.event],
  );
  if (existing.rows[0]) {
    await client.query("ROLLBACK");
    console.log(JSON.stringify({ created: false, registrationId: existing.rows[0].registration_id }));
    process.exit(0);
  }

  const nextIdResult = await client.query("SELECT COALESCE(MAX(id), 1000) + 1 AS id FROM registrationData");
  const registrationId = Number(nextIdResult.rows[0].id);
  const transactionId = `MANUAL-PAID-${registrationId}-${Date.now()}`;

  await client.query(
    `INSERT INTO registrationData (
       id, isteam, teamname, member_1, member_2,
       member_2_email, member_2_phonenumber, member_2_department, member_2_university,
       member_3, member_3_email, member_3_phonenumber, member_3_department, member_3_university,
       email, phonenumber, department, university, criteria, fee, ispaid, tran_id, reference_code
     ) VALUES (
       $1, FALSE, '', $2, '', '', '', '', '', '', '', '', '', '',
       $3, $4, $5, $6, ARRAY[$7]::TEXT[], $8, TRUE, $9, NULL
     )`,
    [registrationId, participant.name, participant.email, participant.phone,
      participant.department, participant.university, participant.event, participant.fee, transactionId],
  );

  await client.query(
    `INSERT INTO singleRegistrationData (
       registration_id, name, email, phonenumber, department, university, events
     ) VALUES ($1, $2, $3, $4, $5, $6, ARRAY[$7]::TEXT[])`,
    [registrationId, participant.name, participant.email, participant.phone,
      participant.department, participant.university, participant.event],
  );

  await client.query("COMMIT");
  console.log(JSON.stringify({ created: true, registrationId }));
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}