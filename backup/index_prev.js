
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let collection = await db.collection('users');
    let user = await collection.findOne({ username });

    if (user && user.password === password) {
      const response = {
        success: true,
        userId: user._id.toString()
      };

      // Check if MFA is enabled for the user
      if (user.mfaEnabled) {
        response.mfaSecret = user.mfaSecret;
      }
      

      res.status(200).send(response);
    } else {
      res.status(401).send({ success: false });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});