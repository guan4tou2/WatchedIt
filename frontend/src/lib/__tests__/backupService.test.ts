import { BackupService, BackupData } from "@/lib/backup";
import { tagStorage, workStorage } from "@/lib/indexedDB";
import { Work, Tag } from "@/types";

jest.mock("@/lib/indexedDB", () => ({
  workStorage: {
    getAll: jest.fn(),
    clearAll: jest.fn(),
    setAll: jest.fn(),
  },
  tagStorage: {
    getAll: jest.fn(),
    clearAll: jest.fn(),
    setAll: jest.fn(),
  },
}));

const createSampleBackup = (): BackupData => {
  const sampleTag: Tag = { id: 1, name: "Action", color: "#ff0000" };

  const sampleWork: Work = {
    id: "work-1",
    title: "Sample Work",
    type: "動畫",
    status: "進行中",
    year: 2024,
    rating: 9,
    review: "Great story",
    note: "Need to rewatch",
    source: "AniList",
    reminder_enabled: false,
    reminder_frequency: "weekly",
    tags: [sampleTag],
    episodes: [
      {
        id: "episode-1",
        number: 1,
        title: "Episode 1",
        description: "Opening episode",
        type: "episode",
        season: 1,
        watched: true,
        date_watched: "2024-01-02",
        note: "Amazing start",
      },
    ],
    date_added: "2024-01-01T00:00:00.000Z",
    date_updated: "2024-01-03T00:00:00.000Z",
  };

  return {
    version: "1.0.0",
    timestamp: "2024-01-04T00:00:00.000Z",
    works: [sampleWork],
    tags: [sampleTag],
    metadata: {
      totalWorks: 1,
      totalTags: 1,
      totalEpisodes: 1,
      watchedEpisodes: 1,
      completionRate: 100,
    },
  };
};

describe("BackupService helpers", () => {
  const service = BackupService.getInstance() as any;
  const backupData = createSampleBackup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("converts backup data to CSV and parses it back", () => {
    const csv = service.convertToCSV(backupData);
    expect(csv).toContain("WatchedIt Backup Data");
    expect(csv).toContain("Sample Work");
    expect(csv).toContain("Episode 1");

    const parsed = service.parseFromCSV(csv);
    expect(parsed.tags).toHaveLength(1);
    expect(parsed.works).toHaveLength(1);
    expect(parsed.works[0].title).toBe("Sample Work");
    expect(parsed.works[0].episodes).toHaveLength(1);
    expect(parsed.metadata.totalWorks).toBe(1);
    expect(parsed.metadata.totalEpisodes).toBe(1);
  });

  it("preserves commas and quotes in CSV backup fields", () => {
    const specialBackup = createSampleBackup();
    specialBackup.tags[0] = {
      id: 1,
      name: 'Action, "Drama"',
      color: "#ff0000",
    };
    specialBackup.works[0] = {
      ...specialBackup.works[0],
      title: 'Sample, "Quoted" Work',
      tags: [specialBackup.tags[0]],
      review: 'Great, then "better"',
      rating: 8.5,
    };

    const parsed = service.parseFromCSV(service.convertToCSV(specialBackup));

    expect(parsed.tags[0]).toMatchObject({
      name: 'Action, "Drama"',
      color: "#ff0000",
    });
    expect(parsed.works[0]).toMatchObject({
      title: 'Sample, "Quoted" Work',
      review: 'Great, then "better"',
      rating: 8.5,
    });
  });

  it("throws when backup payload misses required fields", () => {
    expect(() =>
      service.validateBackupData({
        timestamp: "2024-01-01T00:00:00.000Z",
      })
    ).toThrow("備份資料缺少版本或時間戳");
  });

  it("rejects invalid work data before clearing existing storage", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const invalidBackup = createSampleBackup();
    invalidBackup.works[0] = {
      ...invalidBackup.works[0],
      title: "",
    };

    try {
      await expect(service.restoreBackup(invalidBackup)).rejects.toThrow(
        "還原備份失敗"
      );
      expect(workStorage.clearAll).not.toHaveBeenCalled();
      expect(tagStorage.clearAll).not.toHaveBeenCalled();
      expect(workStorage.setAll).not.toHaveBeenCalled();
      expect(tagStorage.setAll).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("propagates auto backup failures so the UI can show an error", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    jest.mocked(workStorage.getAll).mockRejectedValue(new Error("read failed"));

    try {
      await expect(service.autoBackup()).rejects.toThrow("自動備份失敗");
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
