# Static assets

The original app's `public/` folder is **git-ignored** in `aankhon-dekha-frontend`,
so images/videos/logos are **not** in source control — they live on the production
server. The rebuilt app references the **same paths**, so once you drop the files in
here they resolve automatically.

Assets currently referenced by the ported pages (copy these from production):

- `Aankhin Dekha Logo.png` — primary logo / favicon
- `TellMe VR Centre Aankhon Dekha Logo.png` — footer logo
- `animals-eagle-pointer.png` — custom cursor
- `book_now.png`, `bg_img.png`, `uncle-sam-character.png` — home hero
- `bhopal/1.png`, `bhopal/3.png`, `bhopal/4.png`, `bhopal/5.png`
- `orchha/orchha (1).jpg`, `orchha/orchha (2).jpg`
- `boat club/boat club.jpeg`, `boat club/boat club1.jpeg`
- `maheshwar/maheshwar.jpeg`, `maheshwar/maheshwar1.jpeg`
- `about/1_about_us.png`, `about/2_about_us.png`, `about/3_about_us.png`,
  `about/4_about_us.png`, `about/book_now_about_us.png`
- `vid/bootom_video_just_above_footer.mp4` — bottom home video

Until the real files are added, image areas render as broken/empty — layout is
otherwise intact.
