
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE =
  "https://ffeyo1bg.execute-api.ap-south-1.amazonaws.com/prod";

export default function CertificateVerification() {
  const { certificateId } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCertificate() {
      setLoading(true);
      setError("");
      setCertificate(null);

      try {
        const response = await fetch(
          `${API_BASE}/verify/${encodeURIComponent(certificateId)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Certificate could not be verified."
          );
        }

        setCertificate(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load certificate.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCertificate();

    return () => controller.abort();
  }, [certificateId]);

  return (
    <main className="verification-page">
      <div className="verification-card">
        <div className="verification-brand">
          <h1>AgriBotics</h1>
          <p>Certificate Verification</p>
        </div>

        {loading && <p>Checking certificate...</p>}

        {!loading && error && (
          <div>
            <h2>Verification unavailable</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && certificate && (
          <>
            <div className="verification-status">
              <span>
                {certificate.status === "valid"
                  ? "✓ Certificate verified"
                  : "Certificate status: " + certificate.status}
              </span>
            </div>

            <p className="certificate-type">
              Certificate of{" "}
              {certificate.certificateType === "completion"
                ? "Completion"
                : certificate.certificateType === "experience"
                ? "Experience"
                : certificate.certificateType}
            </p>

            <h2>{certificate.internName}</h2>

            <p>
              This record confirms the certificate details
              issued by AgriBotics.
            </p>

            <div className="certificate-details">
              <p>
                <strong>Certificate ID:</strong>{" "}
                {certificate.certificateId}
              </p>

              <p>
                <strong>Role:</strong> {certificate.role}
              </p>

              <p>
                <strong>Start date:</strong>{" "}
                {certificate.startDate}
              </p>

              <p>
                <strong>End date:</strong>{" "}
                {certificate.endDate}
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
