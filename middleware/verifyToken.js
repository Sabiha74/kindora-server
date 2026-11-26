
let JWKS;

const verifyToken = async (req, res, next) => {
  try {
    // Authorization header থেকে token নেওয়া
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token is missing",
      });
    }

    const token = authHeader.split(" ")[1];

    // jose হলো ESM package, তাই dynamic import ব্যবহার করছি
    const { jwtVerify, createRemoteJWKSet } = await import("jose");

    // JWKS একবার তৈরি করে পরবর্তী request-এ reuse করা হবে
    if (!JWKS) {
      const authUrl = process.env.BETTER_AUTH_URL;

      if (!authUrl) {
        throw new Error("BETTER_AUTH_URL is missing");
      }

      JWKS = createRemoteJWKSet(
        new URL(`${authUrl}/api/auth/jwks`)
      );
    }

   const { payload } = await jwtVerify(token, JWKS, {
  issuer: process.env.BETTER_AUTH_URL,
  audience: process.env.BETTER_AUTH_URL,
});

    // Verified user information
    req.user = payload;

    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

module.exports = verifyToken;
