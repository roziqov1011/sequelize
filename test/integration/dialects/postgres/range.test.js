'use strict';

const chai    = require('chai');

const expect  = chai.expect;
const Support = require('../../support');
const { DataTypes } = require('@sequelize/core');

const dialect = Support.getTestDialect();
const range   = require('@sequelize/core/lib/dialects/postgres/range');

if (dialect.startsWith('postgres')) {
  // Don't try to load pg until we know we're running on postgres.
  const pg = require('pg');

  describe('[POSTGRES Specific] range datatype', () => {
    describe('stringify', () => {
      it('should handle empty objects correctly', () => {
        expect(range.stringify([])).to.equal('empty');
      });

      it('should handle null as empty bound', () => {
        expect(range.stringify([null, 1])).to.equal('[,1)');
        expect(range.stringify([1, null])).to.equal('[1,)');
        expect(range.stringify([null, null])).to.equal('[,)');
      });

      it('should handle Infinity/-Infinity as infinity/-infinity bounds', () => {
        expect(range.stringify([Number.POSITIVE_INFINITY, 1])).to.equal('[infinity,1)');
        expect(range.stringify([1, Number.POSITIVE_INFINITY])).to.equal('[1,infinity)');
        expect(range.stringify([Number.NEGATIVE_INFINITY, 1])).to.equal('[-infinity,1)');
        expect(range.stringify([1, Number.NEGATIVE_INFINITY])).to.equal('[1,-infinity)');
        expect(range.stringify([Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY])).to.equal('[-infinity,infinity)');
      });

      it('should throw error when array length is no 0 or 2', () => {
        expect(() => {
          range.stringify([1]);
        }).to.throw();
        expect(() => {
          range.stringify([1, 2, 3]);
        }).to.throw();
      });

      it('should throw error when non-array parameter is passed', () => {
        expect(() => {
          range.stringify({});
        }).to.throw();
        expect(() => {
          range.stringify('test');
        }).to.throw();
        expect(() => {
          range.stringify();
        }).to.throw();
      });

      it('should handle array of objects with `inclusive` and `value` properties', () => {
        expect(range.stringify([{ inclusive: true, value: 0 }, { value: 1 }])).to.equal('[0,1)');
        expect(range.stringify([{ inclusive: true, value: 0 }, { inclusive: true, value: 1 }])).to.equal('[0,1]');
        expect(range.stringify([{ inclusive: false, value: 0 }, 1])).to.equal('(0,1)');
        expect(range.stringify([0, { inclusive: true, value: 1 }])).to.equal('[0,1]');
      });

      it('should handle date values', () => {
        const Range = new DataTypes.postgres.RANGE(DataTypes.DATE);
        expect(Range.stringify([new Date(Date.UTC(2000, 1, 1)),
          new Date(Date.UTC(2000, 1, 2))], { timezone: '+02:00' })).to.equal('\'["2000-02-01 02:00:00.000 +02:00","2000-02-02 02:00:00.000 +02:00")\'');
      });
    });

    describe('stringify value', () => {

      it('should stringify integer values with appropriate casting', () => {
        const Range = new DataTypes.postgres.RANGE(DataTypes.INTEGER);
        expect(Range.stringify(1)).to.equal('\'1\'::int4');
      });

      it('should stringify bigint values with appropriate casting', () => {
        const Range = new DataTypes.postgres.RANGE(DataTypes.BIGINT);
        expect(Range.stringify(1)).to.equal('\'1\'::int8');
      });

      it('should stringify numeric values with appropriate casting', () => {
        const Range = new DataTypes.postgres.RANGE(DataTypes.DECIMAL);
        expect(Range.stringify(1.1)).to.equal('\'1.1\'::numeric');
      });

      it('should stringify dateonly values with appropriate casting', () => {
        const Range = new DataTypes.postgres.RANGE(DataTypes.DATEONLY);
        expect(Range.stringify(new Date(Date.UTC(2000, 1, 1)))).to.include('::date');
      });

      it('should stringify date values with appropriate casting', () => {
        const Range = new DataTypes.postgres.RANGE(DataTypes.DATE);
        expect(Range.stringify(new Date(Date.UTC(2000, 1, 1)), { timezone: '+02:00' })).to.equal('\'2000-02-01 02:00:00.000 +02:00\'::timestamptz');
      });

      describe('with null range bounds', () => {
        const infiniteRange = [null, null];
        const infiniteRangeSQL = '\'[,)\'';

        it('should stringify integer range to infinite range', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.INTEGER);
          expect(Range.stringify(infiniteRange)).to.equal(infiniteRangeSQL);
        });

        it('should stringify bigint range to infinite range', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.BIGINT);
          expect(Range.stringify(infiniteRange)).to.equal(infiniteRangeSQL);
        });

        it('should stringify numeric range to infinite range', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.DECIMAL);
          expect(Range.stringify(infiniteRange)).to.equal(infiniteRangeSQL);
        });

        it('should stringify dateonly ranges appropriately', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.DATEONLY);
          expect(Range.stringify(infiniteRange)).to.equal(infiniteRangeSQL);
        });

        it('should be stringified to appropriate unbounded postgres range', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.DATEONLY);
          expect(Range.stringify(infiniteRange)).to.equal(infiniteRangeSQL);
        });

        it('should stringify date values with appropriate casting', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.DATE);
          expect(Range.stringify(infiniteRange, { timezone: '+02:00' })).to.equal(infiniteRangeSQL);
        });

      });

      describe('with infinite range bounds', () => {
        const infiniteRange = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
        const infiniteRangeSQL = '\'[-infinity,infinity)\'';

        it('should stringify integer range to infinite range', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.INTEGER);
          expect(Range.stringify(infiniteRange)).to.equal(infiniteRangeSQL);
        });

        it('should stringify bigint range to infinite range', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.BIGINT);
          expect(Range.stringify(infiniteRange)).to.equal(infiniteRangeSQL);
        });

        it('should stringify numeric range to infinite range', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.DECIMAL);
          expect(Range.stringify(infiniteRange)).to.equal(infiniteRangeSQL);
        });

        it('should stringify dateonly ranges appropriately', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.DATEONLY);
          expect(Range.stringify(infiniteRange)).to.equal(infiniteRangeSQL);
        });

        it('should be stringified to appropriate unbounded postgres range', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.DATEONLY);
          expect(Range.stringify(infiniteRange)).to.equal(infiniteRangeSQL);
        });

        it('should stringify date values with appropriate casting', () => {
          const Range = new DataTypes.postgres.RANGE(DataTypes.DATE);
          expect(Range.stringify(infiniteRange, { timezone: '+02:00' })).to.equal(infiniteRangeSQL);
        });

      });

    });

    describe('parse', () => {
      it('should handle a null object correctly', () => {
        expect(range.parse(null)).to.equal(null);
      });

      it('should handle empty range string correctly', () => {
        expect(range.parse('empty')).to.deep.equal([]);
      });

      it('should handle empty bounds correctly', () => {
        expect(range.parse('(1,)', DataTypes.postgres.INTEGER.parse)).to.deep.equal([{ value: 1, inclusive: false }, { value: null, inclusive: false }]);
        expect(range.parse('(,1)', DataTypes.postgres.INTEGER.parse)).to.deep.equal([{ value: null, inclusive: false }, { value: 1, inclusive: false }]);
        expect(range.parse('(,)', DataTypes.postgres.INTEGER.parse)).to.deep.equal([{ value: null, inclusive: false }, { value: null, inclusive: false }]);
      });

      it('should handle infinity/-infinity bounds correctly', () => {
        expect(range.parse('(infinity,1)', DataTypes.postgres.INTEGER.parse)).to.deep.equal([{ value: Number.POSITIVE_INFINITY, inclusive: false }, { value: 1, inclusive: false }]);
        expect(range.parse('(1,infinity)',  DataTypes.postgres.INTEGER.parse)).to.deep.equal([{ value: 1, inclusive: false }, { value: Number.POSITIVE_INFINITY, inclusive: false }]);
        expect(range.parse('(-infinity,1)',  DataTypes.postgres.INTEGER.parse)).to.deep.equal([{ value: Number.NEGATIVE_INFINITY, inclusive: false }, { value: 1, inclusive: false }]);
        expect(range.parse('(1,-infinity)',  DataTypes.postgres.INTEGER.parse)).to.deep.equal([{ value: 1, inclusive: false }, { value: Number.NEGATIVE_INFINITY, inclusive: false }]);
        expect(range.parse('(-infinity,infinity)',  DataTypes.postgres.INTEGER.parse)).to.deep.equal([{ value: Number.NEGATIVE_INFINITY, inclusive: false }, { value: Number.POSITIVE_INFINITY, inclusive: false }]);
      });

      it('should return raw value if not range is returned', () => {
        expect(range.parse('some_non_array')).to.deep.equal('some_non_array');
      });

      it('should handle native postgres timestamp format', async () => {
        // Make sure nameOidMap is loaded
        const connection = await Support.sequelize.connectionManager.getConnection();

        Support.sequelize.connectionManager.releaseConnection(connection);

        const tsName = DataTypes.postgres.DATE.types.postgres[0];
        const tsOid = Support.sequelize.connectionManager.nameOidMap[tsName].oid;
        const parser = pg.types.getTypeParser(tsOid);
        expect(range.parse('(2016-01-01 08:00:00-04,)', parser)[0].value.toISOString()).to.equal('2016-01-01T12:00:00.000Z');
      });

    });
    describe('stringify and parse', () => {
      it('should stringify then parse back the same structure', () => {
        const testRange = [{ value: 5, inclusive: true }, { value: 10, inclusive: true }];
        const Range = new DataTypes.postgres.RANGE(DataTypes.INTEGER);

        let stringified = Range.stringify(testRange, {});
        stringified = stringified.slice(1, 1 + stringified.length - 2); // Remove the escaping ticks

        expect(DataTypes.postgres.RANGE.parse(stringified, { parser: DataTypes.postgres.INTEGER.parse })).to.deep.equal(testRange);
      });
    });
  });
}
