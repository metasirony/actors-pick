from pathlib import Path
import re

path = Path('/home/user/workspace/hmm-actors/src/data/actors.ts')
source = path.read_text()
replacements = {
    ('bi', 'Beyonce'): ('Beanie Feldstein', 'Beanie Feldstein', 'Beanie — “bee”'),
    ('bi', 'Beyonce Knowles-Carter'): ('Brooke Shields', 'Brooke Shields', 'Brooke — “b”'),
    ('bu', 'Buzz Lightyear'): ('Baymax', 'Baymax', 'Baymax — “bay”'),
    ('pu', 'Popeye'): ('Peter Griffin', 'Peter Griffin', 'Peter — “puh”'),
    ('tu', 'Tyrion Lannister'): ('Tetsuo Shima', 'Tetsuo Shima', 'Tetsuo — “teh”'),
    ('tu', 'Thor'): ('Tin Man', 'Tin Man', 'Tin — “tin”'),
    ('nu', 'Naruto Uzumaki'): ('Numbuh One', 'Numbuh 1', 'Numbuh — “num”'),
    ('nu', 'Nala'): ('Nibbler', 'Nibbler (Futurama)', 'Nibbler — “nib”'),
    ('lu', 'Legolas'): ('Lancelot', 'Lancelot', 'Lancelot — “lan”'),
    ('lu', 'Loki'): ('Leon S. Kennedy', 'Leon S. Kennedy', 'Leon — “lee”'),
    ('lu', 'Lara Croft'): ('Lapis Lazuli', 'Lapis Lazuli (Steven Universe)', 'Lapis — “lap”'),
    ('lu', 'Lara Croft (Tomb Raider)'): ('Lady Rainicorn', 'Lady Rainicorn', 'Lady — “lay”'),
    ('lü', 'Luke Skywalker'): ('Lucy Pevensie', 'Lucy Pevensie', 'Lucy — “lyoo”'),
    ('lü', 'Ludwig van Beethoven'): ('Luther Hargreeves', 'Luther Hargreeves', 'Luther — “lyoo”'),
    ('lü', 'Luffy'): ('Lulu', 'Lulu (Final Fantasy X)', 'Lulu — “lyoo”'),
    ('lü', 'Lumiere'): ('Lola Bunny', 'Lola Bunny', 'Lola — “lyoo”'),
    ('lü', 'Lucifer Morningstar'): ('Lupin III', 'Lupin III', 'Lupin — “lyoo”'),
    ('z', 'Zeus'): ('Zac Brown', 'Zac Brown Band', 'Zac — “zuh”'),
    ('zu', 'Zorro (One Piece)'): ('Zeref Dragneel', 'Zeref Dragneel', 'Zeref — “zeh”'),
    ('zu', 'Zordon'): ('Ziggy Grover', 'Ziggy Grover', 'Ziggy — “zig”'),
    ('c', 'Count Dracula'): ('Count von Count', 'Count von Count', 'Count — “k”'),
    ('c', 'Captain Jack Sparrow'): ('Captain Hook', 'Captain Hook', 'Captain — “k”'),
    ('c', 'Chucky'): ('C-3PO', 'C-3PO', 'C — “see”'),
    ('s', 'Superman'): ('Seth MacFarlane', 'Seth MacFarlane', 'Seth — “suh”'),
    ('s', 'Sonic the Hedgehog'): ('Steve Martin', 'Steve Martin', 'Steve — “suh”'),
    ('s', 'Sherlock Holmes'): ('Stan Lee', 'Stan Lee', 'Stan — “suh”'),
    ('s', 'Shrek'): ('Seth Rogen', 'Seth Rogen', 'Seth — “suh”'),
    ('sh', 'Shaquille O’Neal'): ('Shigeru Miyamoto', 'Shigeru Miyamoto', 'Shigeru — “sh”'),
    ('sh', 'Sherlock Holmes'): ('Shawn Fonteno', 'Shawn Fonteno', 'Shawn — “sh”'),
    ('sh', 'Shrek'): ('Shawn Wayans', 'Shawn Wayans', 'Shawn — “sh”'),
    ('zhu', 'Joker'): ('Jiraiya', 'Jiraiya (Naruto)', 'Jiraiya — “joo”'),
    ('chu', 'Chewbacca'): ('Chespin', 'Chespin', 'Chespin — “che”'),
    ('shu', 'Sherlock Holmes'): ('Shino Aburame', 'Shino Aburame', 'Shino — “shee”'),
    ('shu', 'Shrek'): ('Shifu', 'Master Shifu', 'Shifu — “shee”'),
    ('shu', 'Shaggy Rogers'): ('Shin Chan', 'Crayon Shin-chan', 'Shin — “sheen”'),
    ('shu', 'Shazam'): ('Shantae', 'Shantae', 'Shantae — “shan”'),
    ('gu', 'Goku'): ('Gatsby', 'Jay Gatsby', 'Gatsby — “gat”'),
    ('gu', 'Gandalf'): ('Garrus Vakarian', 'Garrus Vakarian', 'Garrus — “gar”'),
    ('gu', 'Godzilla'): ('Gargamel', 'Gargamel', 'Gargamel — “gar”'),
    ('gu', 'Gollum'): ('Gumball Watterson', 'Gumball Watterson', 'Gumball — “gum”'),
    ('gu', 'Gru'): ('Gustavo Fring', 'Gustavo Fring', 'Gustavo — “gus”'),
    ('k', 'King Kong'): ('Karl Urban', 'Karl Urban', 'Karl — “kuh”'),
    ('ku', 'Kermit the Frog'): ('Kang the Conqueror', 'Kang the Conqueror', 'Kang — “kang”'),
    ('ku', 'Kermit'): ('Kool-Aid Man', 'Kool-Aid Man', 'Kool — “kool”'),
    ('h', 'Harry Potter'): ('Harvey Dent', 'Harvey Dent', 'Harvey — “huh”'),
    ('hu', 'Homer Simpson'): ('Haku', 'Haku (Spirited Away)', 'Haku — “hah”'),
    ('hu', 'Hulk'): ('Hakuoro', 'Hakuoro', 'Hakuoro — “hah”'),
    ('pi', 'P!nk'): ('Pia Zadora', 'Pia Zadora', 'Pia — “pee”'),
    ('qu', 'Queen Amidala'): ('Queen Hippolyta', 'Hippolyta (DC Comics)', 'Queen — “kween”'),
    ('ti', 'Tinker Bell'): ('Tatum O’Neal', 'Tatum O’Neal', 'Tatum — “tih”'),
    ('ni', 'Nala'): ('Nina Dobrev', 'Nina Dobrev', 'Nina — “nee”'),
    ('li', 'Lara Croft'): ('Lana Condor', 'Lana Condor', 'Lana — “lah”'),
    ('ji', 'Julia Roberts'): ('Janelle Monáe', 'Janelle Monáe', 'Janelle — “jih”'),
    ('ju', 'Julia Roberts'): ('Jurnee Smollett', 'Jurnee Smollett', 'Jurnee — “joo”'),
    ('ju', 'Judy Garland'): ('Julie Andrews', 'Julie Andrews', 'Julie — “joo”'),
    ('zhu', 'Jean Grey'): ('Jorah Mormont', 'Jorah Mormont', 'Jorah — “jor”'),
    ('xu', 'Xena'): ('Xuxa', 'Xuxa', 'Xuxa — “shoo”'),
    ('wu', 'Wolverine (X-Men)'): ('Westley', 'Westley (The Princess Bride)', 'Westley — “wes”'),
    ('bu', 'Bender Rodriguez'): ('Brainiac', 'Brainiac (character)', 'Brainiac — “bray”'),
    ('fu', 'Fiona'): ('Fuu', 'Fuu (Samurai Champloo)', 'Fuu — “foo”'),
    ('cu', 'Super Mario'): ('Sailor Jupiter', 'Sailor Jupiter', 'Sailor — “sai”'),
    ('nü', 'Nyan Cat'): ('Nyaruko', 'Nyaruko: Crawling with Love', 'Nyaruko — “nyan”'),
    ('su', 'Sonic the Hedgehog'): ('Sailor Mercury', 'Sailor Mercury', 'Sailor — “sai”'),
    ('ju', 'Judy Hopps'): ('June Moone', 'June Moone', 'June — “joon”'),
    ('xu', 'Xmas Grinch'): ('Xurkitree', 'Xurkitree', 'Xurkitree — “shur”'),
    ('du', 'Dracula'): ('Duke Nukem', 'Duke Nukem', 'Duke — “dook”'),
}

for (key, old_name), (new_name, wiki, hint) in replacements.items():
    pattern = rf'(  {re.escape(key)}: list\(\[.*?)(\n  \]\),)'
    match = re.search(pattern, source, flags=re.S)
    if not match:
        raise SystemExit(f'key not found: {key}')
    section = match.group(1)
    old_pattern = rf'(\["{re.escape(old_name)}", )"[^"]+", "[^"]+"(\],)'
    section, count = re.subn(old_pattern, rf'\1"{wiki}", "{hint}"\2', section, count=1)
    if count != 1:
        raise SystemExit(f'entry not found: {key} / {old_name}')
    # Replace only the name field after validating tuple presence
    section = section.replace(f'["{old_name}", "{wiki}", "{hint}"]', f'["{new_name}", "{wiki}", "{hint}"]', 1)
    source = source[:match.start(1)] + section + source[match.end(1):]

path.write_text(source)
