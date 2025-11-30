import { BackupService, BackupData } from "@/lib/backup";
import { Work, Tag } from "@/types";

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

  it("throws when backup payload misses required fields", () => {
    expect(() =>
      service.validateBackupData({
        timestamp: "2024-01-01T00:00:00.000Z",
      })
    ).toThrow("備份資料缺少版本或時間戳");
  });
});

