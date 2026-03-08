/**
 * Contract test: validates that the frontend audit API client
 * correctly handles the expected Audit API response shape.
 * No jest-pact dependency; uses Jest + fetch mock.
 */
import { getAuditLogs } from "../../lib/auditApi";

const mockFetch = jest.fn();

describe("Audit API Contract Test", () => {
  beforeEach(() => {
    jest.resetModules();
    global.fetch = mockFetch;
  });

  it("validates the contract for fetching audit logs", async () => {
    const contractResponse = {
      data: [
        {
          _id: "1",
          action: "LOGIN",
          timestamp: "2026-02-28T12:00:00Z",
          username: "user1",
          resource: "auth",
          details: "User logged in",
          ipAddress: "127.0.0.1",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(contractResponse),
    });

    const response = await getAuditLogs("mock-token");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/audit/),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token",
        }),
      })
    );
    expect(response).toEqual(contractResponse);
    expect(response.data).toHaveLength(1);
    expect(response.data[0]).toMatchObject({
      _id: "1",
      action: "LOGIN",
      timestamp: "2026-02-28T12:00:00Z",
    });
  });

  it("throws when the API returns an error status", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    await expect(getAuditLogs("mock-token")).rejects.toThrow(
      "Failed to fetch audit logs"
    );
  });
});
