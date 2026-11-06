import { describe, it, expect } from 'vitest';

export interface CanonicalReconciliationInput {
  sourceSlug: string;
  sourceRecordId: string;
  sipaerCode?: string;
  aircraftRegistration?: string;
  occurrenceDate: string; // YYYY-MM-DD
}

export interface CanonicalEntity {
  canonicalId: string;
  sipaerCode?: string;
  primarySource: string;
  sourcesLinked: string[];
  aircraftRegistration?: string;
  occurrenceDate: string;
}

export class CanonicalReconciliationEngine {
  private canonicalStore: Map<string, CanonicalEntity> = new Map();

  /**
   * Reconcilia ocorrências entre ANAC e CENIPA garantindo identidade canônica única
   */
  public reconcile(input: CanonicalReconciliationInput): CanonicalEntity {
    // 1. Tenta correspondência exata por código SIPAER
    if (input.sipaerCode) {
      for (const entity of this.canonicalStore.values()) {
        if (entity.sipaerCode === input.sipaerCode) {
          if (!entity.sourcesLinked.includes(input.sourceSlug)) {
            entity.sourcesLinked.push(input.sourceSlug);
          }
          return entity;
        }
      }
    }

    // 2. Tenta correspondência por Matrícula + Data exata
    if (input.aircraftRegistration && input.aircraftRegistration !== 'N/A') {
      for (const entity of this.canonicalStore.values()) {
        if (
          entity.aircraftRegistration === input.aircraftRegistration &&
          entity.occurrenceDate === input.occurrenceDate
        ) {
          if (!entity.sourcesLinked.includes(input.sourceSlug)) {
            entity.sourcesLinked.push(input.sourceSlug);
          }
          if (input.sipaerCode && !entity.sipaerCode) {
            entity.sipaerCode = input.sipaerCode;
          }
          return entity;
        }
      }
    }

    // 3. Caso não encontre correspondência prévia, cria nova entidade canônica primária
    const newCanonicalId = `canonical-${Math.random().toString(36).substring(2, 9)}`;
    const newEntity: CanonicalEntity = {
      canonicalId: newCanonicalId,
      sipaerCode: input.sipaerCode,
      primarySource: input.sourceSlug,
      sourcesLinked: [input.sourceSlug],
      aircraftRegistration: input.aircraftRegistration,
      occurrenceDate: input.occurrenceDate
    };

    this.canonicalStore.set(newCanonicalId, newEntity);
    return newEntity;
  }

  public getEntityCount(): number {
    return this.canonicalStore.size;
  }
}

describe('Canonical Reconciliation Engine (ANAC x CENIPA)', () => {
  it('deve unificar registro ANAC e relatório CENIPA em uma única entidade canônica via Código SIPAER', () => {
    const engine = new CanonicalReconciliationEngine();

    // CENIPA insere relatório SIPAER A-145/CENIPA/2021
    const cenipaEntity = engine.reconcile({
      sourceSlug: 'cenipa',
      sourceRecordId: '80999',
      sipaerCode: 'A-145/CENIPA/2021',
      aircraftRegistration: 'PT-ONJ',
      occurrenceDate: '2021-11-05'
    });

    // ANAC insere ocorrência referente ao mesmo código SIPAER
    const anacEntity = engine.reconcile({
      sourceSlug: 'anac',
      sourceRecordId: '20211105001',
      sipaerCode: 'A-145/CENIPA/2021',
      aircraftRegistration: 'PT-ONJ',
      occurrenceDate: '2021-11-05'
    });

    expect(engine.getEntityCount()).toBe(1);
    expect(cenipaEntity.canonicalId).toBe(anacEntity.canonicalId);
    expect(anacEntity.sourcesLinked).toContain('cenipa');
    expect(anacEntity.sourcesLinked).toContain('anac');
  });

  it('não deve unificar acidentes em locais próximos se matrículas ou datas forem distintas', () => {
    const engine = new CanonicalReconciliationEngine();

    // Acidente 1 no mesmo aeródromo
    engine.reconcile({
      sourceSlug: 'anac',
      sourceRecordId: 'REC-01',
      aircraftRegistration: 'PT-AAA',
      occurrenceDate: '2022-03-10'
    });

    // Acidente 2 no mesmo aeródromo dias depois
    engine.reconcile({
      sourceSlug: 'anac',
      sourceRecordId: 'REC-02',
      aircraftRegistration: 'PT-BBB',
      occurrenceDate: '2022-03-15'
    });

    expect(engine.getEntityCount()).toBe(2);
  });
});

