import { ImplementableCard } from '@shared/engine_types';
import { AgelessGuardian } from './cards/AgelessGuardian';
import { ArrogantPoet } from './cards/ArrogantPoet';
import { BayouGroff } from './cards/BayouGroff';
import { BigPlay } from './cards/BigPlay';
import { BloodAgeGeneral } from './cards/BloodAgeGeneral';
import { BeamingDefiance } from './cards/BeamingDefiance';
import { CombatProfessor } from './cards/CombatProfessor';
import { DefendTheCampus } from './cards/DefendTheCampus';
import { DuelingCoach } from './cards/DuelingCoach';
import { Expel } from './cards/Expel';
import { HallMonitor } from './cards/HallMonitor';
import { StarPupil } from './cards/StarPupil';
import { StoneriseSpirit } from './cards/StoneriseSpirit';
import { ExhilaratingElocution } from './cards/ExhilaratingElocution';
import { FirstDayOfClass } from './cards/FirstDayOfClass';
import { FractalSummoning } from './cards/FractalSummoning';
import { PillardropRescuer } from './cards/PillardropRescuer';
import { SpringmaneCervin } from './cards/SpringmaneCervin';
import { ArchmageEmeritus } from './cards/ArchmageEmeritus';
import { CleverLumimancer } from './cards/CleverLumimancer';
import { DragonsguardElite } from './cards/DragonsguardElite';
import { EagerFirstYear } from './cards/EagerFirstYear';
import { LeoninLightscribe } from './cards/LeoninLightscribe';
import { LoreholdPledgemage } from './cards/LoreholdPledgemage';
import { PrismariApprentice } from './cards/PrismariApprentice';
import { PrismariPledgemage } from './cards/PrismariPledgemage';
import { QuandrixApprentice } from './cards/QuandrixApprentice';
import { QuandrixPledgemage } from './cards/QuandrixPledgemage';
import { SedgemoorWitch } from './cards/SedgemoorWitch';
import { SilverquillApprentice } from './cards/SilverquillApprentice';
import { SilverquillPledgemage } from './cards/SilverquillPledgemage';
import { StormKilnArtist } from './cards/StormKilnArtist';
import { SymmetrySage } from './cards/SymmetrySage';
import { WitherbloomApprentice } from './cards/WitherbloomApprentice';
import { WitherbloomPledgemage } from './cards/WitherbloomPledgemage';
import { SpellSatchel } from './cards/SpellSatchel';
import { ArchwayCommons } from './cards/ArchwayCommons';
import { BiblioplexAssistant } from './cards/BiblioplexAssistant';
import { DinaSoulSteeper } from './cards/DinaSoulSteeper';
import { BloodResearcher } from './cards/BloodResearcher';
import { EssenceInfusion } from './cards/EssenceInfusion';
import { Flunk } from './cards/Flunk';
import { Fracture } from './cards/Fracture';
import { EurekaMoment } from './cards/EurekaMoment';
import { ExcavatedWall } from './cards/ExcavatedWall';
import { LashOfMalice } from './cards/LashOfMalice';
import { LeechFanatic } from './cards/LeechFanatic';
import { InfuseWithVitality } from './cards/InfuseWithVitality';
import { IntroductionToAnnihilation } from './cards/IntroductionToAnnihilation';
import { IntroductionToProphecy } from './cards/IntroductionToProphecy';
import { KillianInkDuelist } from './cards/KillianInkDuelist';
import { MageHunter } from './cards/MageHunter';
import { ManifestationSage } from './cards/ManifestationSage';
import { MultipleChoice } from './cards/MultipleChoice';
import { PopQuiz } from './cards/PopQuiz';
import { PracticalResearch } from './cards/PracticalResearch';
import { QuandrixCultivator } from './cards/QuandrixCultivator';
import { ReconstructHistory } from './cards/ReconstructHistory';
import { STX_MDFCS, STX_MDFC_LOGIC } from './cards/A6_MDFCs';
import { 
    GalazethPrismari, BeledrosWitherbloom, ShadrixSilverquill, TanazirQuandrix, VelomachusLorehold, 
    PrismariCommand, WitherbloomCommand, SilverquillCommand, QuandrixCommand, LoreholdCommand 
} from './cards/A7_Dragons_Commands';
import { STX_BATCH_3 } from './cards/A8_Batch3';

export const stx: Record<string, ImplementableCard> = {
    'Ageless Guardian': AgelessGuardian,
    'Arrogant Poet': ArrogantPoet,
    'Bayou Groff': BayouGroff,
    'Big Play': BigPlay,
    'Blood Age General': BloodAgeGeneral,
    'Beaming Defiance': BeamingDefiance,
    'Combat Professor': CombatProfessor,
    'Defend the Campus': DefendTheCampus,
    'Dueling Coach': DuelingCoach,
    'Expel': Expel,
    'Hall Monitor': HallMonitor,
    'Star Pupil': StarPupil,
    'Stonerise Spirit': StoneriseSpirit,
    'Exhilarating Elocution': ExhilaratingElocution,
    'First Day of Class': FirstDayOfClass,
    'Fractal Summoning': FractalSummoning,
    'Pillardrop Rescuer': PillardropRescuer,
    'Springmane Cervin': SpringmaneCervin,
    'Archmage Emeritus': ArchmageEmeritus,
    'Clever Lumimancer': CleverLumimancer,
    'Dragonsguard Elite': DragonsguardElite,
    'Eager First-Year': EagerFirstYear,
    'Leonin Lightscribe': LeoninLightscribe,
    'Lorehold Pledgemage': LoreholdPledgemage,
    'Prismari Apprentice': PrismariApprentice,
    'Prismari Pledgemage': PrismariPledgemage,
    'Quandrix Apprentice': QuandrixApprentice,
    'Quandrix Pledgemage': QuandrixPledgemage,
    'Sedgemoor Witch': SedgemoorWitch,
    'Silverquill Apprentice': SilverquillApprentice,
    'Silverquill Pledgemage': SilverquillPledgemage,
    'Storm-Kiln Artist': StormKilnArtist,
    'Symmetry Sage': SymmetrySage,
    'Witherbloom Apprentice': WitherbloomApprentice,
    'Witherbloom Pledgemage': WitherbloomPledgemage,
    'Spell Satchel': SpellSatchel,
    'Archway Commons': ArchwayCommons,
    'Biblioplex Assistant': BiblioplexAssistant,
    'Dina, Soul Steeper': DinaSoulSteeper,
    'Blood Researcher': BloodResearcher,
    'Essence Infusion': EssenceInfusion,
    'Flunk': Flunk,
    'Fracture': Fracture,
    'Eureka Moment': EurekaMoment,
    'Excavated Wall': ExcavatedWall,
    'Lash of Malice': LashOfMalice,
    'Leech Fanatic': LeechFanatic,
    'Infuse with Vitality': InfuseWithVitality,
    'Introduction to Annihilation': IntroductionToAnnihilation,
    'Introduction to Prophecy': IntroductionToProphecy,
    'Killian, Ink Duelist': KillianInkDuelist,
    'Mage Hunter': MageHunter,
    'Manifestation Sage': ManifestationSage,
    'Multiple Choice': MultipleChoice,
    'Pop Quiz': PopQuiz,
    'Practical Research': PracticalResearch,
    'Quandrix Cultivator': QuandrixCultivator,
    'Reconstruct History': ReconstructHistory,
    // MDFCs
    'Valentin, Dean of the Vein': { ...STX_MDFCS['Valentin, Dean of the Vein'], abilities: STX_MDFC_LOGIC['Valentin, Dean of the Vein'].abilities },
    'Lisette, Dean of the Root': { ...STX_MDFCS['Lisette, Dean of the Root'], abilities: STX_MDFC_LOGIC['Lisette, Dean of the Root'].abilities },
    'Selfless Glyphweaver': { ...STX_MDFCS['Selfless Glyphweaver'], abilities: STX_MDFC_LOGIC['Selfless Glyphweaver'].abilities },
    'Deadly Vanity': { ...STX_MDFCS['Deadly Vanity'], abilities: STX_MDFC_LOGIC['Deadly Vanity'].abilities },
    'Torrent Sculptor': { ...STX_MDFCS['Torrent Sculptor'], abilities: STX_MDFC_LOGIC['Torrent Sculptor'].abilities },
    'Flamethrower Sonata': { ...STX_MDFCS['Flamethrower Sonata'], abilities: STX_MDFC_LOGIC['Flamethrower Sonata'].abilities },
    'Plargg, Dean of Chaos': { ...STX_MDFCS['Plargg, Dean of Chaos'], abilities: STX_MDFC_LOGIC['Plargg, Dean of Chaos'].abilities },
    'Augusta, Dean of Order': { ...STX_MDFCS['Augusta, Dean of Order'], abilities: STX_MDFC_LOGIC['Augusta, Dean of Order'].abilities },
    'Rowan, Scholar of Sparks': { ...STX_MDFCS['Rowan, Scholar of Sparks'], abilities: STX_MDFC_LOGIC['Rowan, Scholar of Sparks'].abilities },
    'Will, Scholar of Frost': { ...STX_MDFCS['Will, Scholar of Frost'], abilities: STX_MDFC_LOGIC['Will, Scholar of Frost'].abilities },
    // A7: Elder Dragons
    'Galazeth Prismari': GalazethPrismari,
    'Beledros Witherbloom': BeledrosWitherbloom,
    'Shadrix Silverquill': ShadrixSilverquill,
    'Tanazir Quandrix': TanazirQuandrix,
    'Velomachus Lorehold': VelomachusLorehold,
    // A7: Commands
    'Prismari Command': PrismariCommand,
    'Witherbloom Command': WitherbloomCommand,
    'Silverquill Command': SilverquillCommand,
    'Quandrix Command': QuandrixCommand,
    'Lorehold Command': LoreholdCommand,
    ...STX_BATCH_3
};
