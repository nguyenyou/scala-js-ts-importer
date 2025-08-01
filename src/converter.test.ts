import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { convertTsToScala } from './converter'

function readSampleFile(fileName: string): string {
  const filePath = join(process.cwd(), 'samples', fileName)
  if (!existsSync(filePath)) {
    throw new Error(`Sample file not found: ${filePath}`)
  }
  return readFileSync(filePath, 'utf-8')
}

function readExpectedOutput(fileName: string): string {
  return readSampleFile(fileName + '.scala')
}

function testTsFile(fileName: string) {
  const input = readSampleFile(fileName)
  const expected = readExpectedOutput(fileName)
  const packageName = fileName.replace('.d.ts', '')
  
  const actual = convertTsToScala(input, packageName)
  
  expect(actual.trim()).toBe(expected.trim())
}

describe('TypeScript to Scala Converter', () => {
  it('should convert abstract.d.ts', () => {
    testTsFile('abstract.d.ts')
  })

  it('should convert booleanlit.d.ts', () => {
    testTsFile('booleanlit.d.ts')
  })

  it('should convert comma.d.ts', () => {
    testTsFile('comma.d.ts')
  })

  it('should convert duplicateliteraltypes.d.ts', () => {
    testTsFile('duplicateliteraltypes.d.ts')
  })

  it('should convert enum.d.ts', () => {
    testTsFile('enum.d.ts')
  })

  it('should convert export.d.ts', () => {
    testTsFile('export.d.ts')
  })

  it('should convert exportidentifier.d.ts', () => {
    testTsFile('exportidentifier.d.ts')
  })

  it('should convert extendsintersection.d.ts', () => {
    testTsFile('extendsintersection.d.ts')
  })

  it('should convert extendsobject.d.ts', () => {
    testTsFile('extendsobject.d.ts')
  })

  it('should convert generics.d.ts', () => {
    testTsFile('generics.d.ts')
  })

  it('should convert import.d.ts', () => {
    testTsFile('import.d.ts')
  })

  it('should convert indexabletypes.d.ts', () => {
    testTsFile('indexabletypes.d.ts')
  })

  it('should convert intersectiontype.d.ts', () => {
    testTsFile('intersectiontype.d.ts')
  })

  it('should convert jsglobal.d.ts', () => {
    testTsFile('jsglobal.d.ts')
  })

  it('should convert keyof.d.ts', () => {
    testTsFile('keyof.d.ts')
  })

  it('should convert modifiers.d.ts', () => {
    testTsFile('modifiers.d.ts')
  })

  it('should convert nametranslation.d.ts', () => {
    testTsFile('nametranslation.d.ts')
  })

  it('should convert nestedobjectliteraltypes.d.ts', () => {
    testTsFile('nestedobjectliteraltypes.d.ts')
  })

  it('should convert never.d.ts', () => {
    testTsFile('never.d.ts')
  })

  it('should convert numberlit.d.ts', () => {
    testTsFile('numberlit.d.ts')
  })

  it('should convert objectlit.d.ts', () => {
    testTsFile('objectlit.d.ts')
  })

  it('should convert overrides.d.ts', () => {
    testTsFile('overrides.d.ts')
  })

  it('should convert stringlit.d.ts', () => {
    testTsFile('stringlit.d.ts')
  })

  it('should convert then.d.ts', () => {
    testTsFile('then.d.ts')
  })

  it('should convert thistype.d.ts', () => {
    testTsFile('thistype.d.ts')
  })

  it('should convert uniontype.d.ts', () => {
    testTsFile('uniontype.d.ts')
  })
})