import {
  createEvent,
  trackEvent,
  setAnalyticsAdapter,
  createBackendAnalyticsAdapter,
} from "../utils/analytics";

describe("analytics", () => {
  afterEach(() => {
    setAnalyticsAdapter(undefined);
  });

  describe("createEvent", () => {
    it("builds event with id, name, occurredAt", () => {
      const e = createEvent("search_executed");
      expect(e.id).toBeDefined();
      expect(e.id.length).toBeGreaterThan(0);
      expect(e.name).toBe("search_executed");
      expect(e.occurredAt).toBeDefined();
      expect(new Date(e.occurredAt).getTime()).toBeLessThanOrEqual(Date.now() + 1000);
    });

    it("includes properties when provided", () => {
      const e = createEvent("article_opened", { source: "search", articleId: "art-1" });
      expect(e.properties).toEqual({ source: "search", articleId: "art-1" });
    });

    it("omits properties when empty or undefined", () => {
      expect(createEvent("image_tap_miss").properties).toBeUndefined();
      expect(createEvent("lookup_confirmed", {}).properties).toBeUndefined();
    });

    it("allows number and boolean property values", () => {
      const e = createEvent("share_intake_resolved", {
        resultCount: 3,
        hadSelection: false,
      });
      expect(e.properties?.resultCount).toBe(3);
      expect(e.properties?.hadSelection).toBe(false);
    });
  });

  describe("trackEvent and adapter", () => {
    it("invokes adapter with normalized event", () => {
      const seen: { name: string; properties?: Record<string, unknown> }[] = [];
      setAnalyticsAdapter((event) => {
        seen.push({ name: event.name, properties: event.properties });
      });
      trackEvent("search_result_selected", { source: "share", articleId: "art-2" });
      expect(seen).toHaveLength(1);
      expect(seen[0].name).toBe("search_result_selected");
      expect(seen[0].properties).toEqual({ source: "share", articleId: "art-2" });
    });

    it("does not throw when adapter throws", () => {
      setAnalyticsAdapter(() => {
        throw new Error("adapter error");
      });
      expect(() => trackEvent("article_opened", { source: "image" })).not.toThrow();
    });

    it("resets to default when setAnalyticsAdapter(undefined)", () => {
      const seen: string[] = [];
      setAnalyticsAdapter((e) => { seen.push(e.name); });
      trackEvent("lookup_confirmed");
      expect(seen).toHaveLength(1);
      setAnalyticsAdapter(undefined);
      trackEvent("lookup_confirmed");
      expect(seen).toHaveLength(1);
    });
  });

  describe("property shaping for key flows", () => {
    it("lens lookup flow: segment selected, lookup confirmed, candidates shown", () => {
      const events: Array<{ name: string; properties?: Record<string, unknown> }> = [];
      setAnalyticsAdapter((e) => {
        events.push({ name: e.name, properties: e.properties });
      });

      trackEvent("image_segment_selected", { segmentId: "seg-1" });
      trackEvent("lookup_confirmed", { segmentId: "seg-1" });
      trackEvent("lookup_candidates_shown", { candidateCount: 3 });
      trackEvent("lookup_candidate_selected", { hadCandidates: true, hadSelection: true, segmentId: "seg-2" });

      expect(events[0].name).toBe("image_segment_selected");
      expect(events[0].properties?.segmentId).toBe("seg-1");
      expect(events[1].properties?.segmentId).toBe("seg-1");
      expect(events[2].properties?.candidateCount).toBe(3);
      expect(events[3].properties?.hadCandidates).toBe(true);
      expect(events[3].properties?.hadSelection).toBe(true);
    });

    it("search and article opened flow", () => {
      const events: Array<{ name: string; properties?: Record<string, unknown> }> = [];
      setAnalyticsAdapter((e) => {
        events.push({ name: e.name, properties: e.properties });
      });

      trackEvent("search_executed", { queryLength: 10, resultCount: 2 });
      trackEvent("search_result_selected", { source: "search", articleId: "art-1" });
      trackEvent("article_opened", { source: "search", articleId: "art-1" });

      expect(events[0].properties?.queryLength).toBe(10);
      expect(events[0].properties?.resultCount).toBe(2);
      expect(events[1].properties?.source).toBe("search");
      expect(events[2].properties?.source).toBe("search");
    });

    it("share intake and market flow", () => {
      const events: Array<{ name: string; properties?: Record<string, unknown> }> = [];
      setAnalyticsAdapter((e) => {
        events.push({ name: e.name, properties: e.properties });
      });

      trackEvent("share_intake_opened", { hasInput: true, queryLength: 5 });
      trackEvent("share_intake_resolved", { resultCount: 1, hadSelection: false });
      trackEvent("market_item_selected", { destinationType: "internal" });
      trackEvent("article_opened", { source: "market", articleId: "art-m" });

      expect(events[0].properties?.hasInput).toBe(true);
      expect(events[1].properties?.resultCount).toBe(1);
      expect(events[2].properties?.destinationType).toBe("internal");
      expect(events[3].properties?.source).toBe("market");
    });
  });

  describe("createBackendAnalyticsAdapter", () => {
    it("POSTs event array to /v1/analytics/events", () => {
      const fetchMock = jest.fn().mockResolvedValue({ ok: true });
      (global as any).fetch = fetchMock;
      const adapter = createBackendAnalyticsAdapter("http://localhost:8000");
      const event = createEvent("article_opened", { source: "search", articleId: "art-1" });
      adapter(event);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/v1/analytics/events",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toEqual([event]);
      expect(body[0].name).toBe("article_opened");
      expect(body[0].properties?.source).toBe("search");
    });

    it("strips trailing slash from base URL", () => {
      const fetchMock = jest.fn().mockResolvedValue({ ok: true });
      (global as any).fetch = fetchMock;
      const adapter = createBackendAnalyticsAdapter("http://localhost:8000/");
      adapter(createEvent("search_executed"));
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/v1/analytics/events",
        expect.any(Object)
      );
    });
  });
});
