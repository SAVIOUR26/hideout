<?php
/**
 * JWT Helper Functions
 * HGM POS System - JSON Web Token Authentication
 */

class JWT {
    /**
     * Get secret key from config
     */
    private static function getSecretKey() {
        if (defined('JWT_SECRET')) {
            return JWT_SECRET;
        }
        // Fallback if config not loaded (should never happen)
        error_log("WARNING: JWT_SECRET not defined, using fallback");
        return "FALLBACK_SECRET_CHANGE_THIS_IMMEDIATELY";
    }

    /**
     * Generate JWT token
     */
    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::getSecretKey(), true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Decode and verify JWT token
     */
    public static function decode($jwt) {
        $tokenParts = explode('.', $jwt);

        if (count($tokenParts) != 3) {
            return false;
        }

        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);
        $signatureProvided = $tokenParts[2];

        // Verify signature
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::getSecretKey(), true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        if ($base64UrlSignature !== $signatureProvided) {
            return false;
        }

        $payload = json_decode($payload, true);

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }

    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($text) {
        return str_replace(
            ['+', '/', '='],
            ['-', '_', ''],
            base64_encode($text)
        );
    }

    /**
     * Get authorization header
     */
    public static function getBearerToken() {
        $headers = self::getAuthorizationHeader();

        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Get authorization header from request
     */
    private static function getAuthorizationHeader() {
        $headers = null;

        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );

            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        return $headers;
    }

    /**
     * Verify token and return user data
     */
    public static function verifyToken() {
        $token = self::getBearerToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(array("success" => false, "message" => "No token provided"));
            exit();
        }

        $decoded = self::decode($token);

        if (!$decoded) {
            http_response_code(401);
            echo json_encode(array("success" => false, "message" => "Invalid or expired token"));
            exit();
        }

        return $decoded;
    }
}
