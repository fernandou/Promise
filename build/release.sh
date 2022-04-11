set -e
echo "Enter release version: "
read VERSION

read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."

  # lint and test
  # npm run lint 2>/dev/null
  # npm run unit 2>/dev/null

  # commit
  git add -A
  git commit -m "[build] $VERSION"
  # npm version $VERSION --message "[release] $VERSION"

  # publish
  git push
  # npm publish
fi
