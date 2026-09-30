import type { InvitationModel } from "../invitation/model";

/**
 * Export abstraction for future offline / print formats (see docs/roadmap.md).
 *
 * Exporters consume the same InvitationModel as templates, built with
 * mode "export" (static, no animation or audio). No formats are implemented in
 * Phase 1; the service exists so callers and UI can be written against a
 * stable interface.
 */
export const EXPORT_FORMATS = ["pdf", "print", "html-package", "offline-site"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export interface ExportArtifact {
  format: ExportFormat;
  fileName: string;
  contentType: string;
  body: Uint8Array | string;
}

export interface Exporter {
  format: ExportFormat;
  export(model: InvitationModel): Promise<ExportArtifact>;
}

export class ExportNotAvailableError extends Error {
  constructor(public readonly format: ExportFormat) {
    super(`Export format "${format}" is not available yet.`);
    this.name = "ExportNotAvailableError";
  }
}

export class ExportService {
  private readonly exporters: Map<ExportFormat, Exporter>;

  constructor(exporters: Exporter[] = []) {
    this.exporters = new Map(exporters.map((e) => [e.format, e]));
  }

  supports(format: ExportFormat): boolean {
    return this.exporters.has(format);
  }

  availableFormats(): ExportFormat[] {
    return EXPORT_FORMATS.filter((f) => this.exporters.has(f));
  }

  async export(format: ExportFormat, model: InvitationModel): Promise<ExportArtifact> {
    if (model.mode !== "export") {
      throw new Error('Exports must be built with render mode "export".');
    }
    const exporter = this.exporters.get(format);
    if (!exporter) throw new ExportNotAvailableError(format);
    return exporter.export(model);
  }
}

/** Phase 1: no exporters registered. */
export const exportService = new ExportService();
